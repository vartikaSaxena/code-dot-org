# Test in rails console:
# load "../lib/cdo/cr_new.rb"
# ContactRollupsV2.test
# ContactRollupsV2.main

require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require_relative '../../deployment'
require 'cdo/pegasus'
require 'set'

class ContactRollupsV2
  # Database names
  PEGASUS_ENV = (Rails.env.production? ? "" : "_#{Rails.env}").freeze
  PEGASUS_DB_NAME = "pegasus#{PEGASUS_ENV}".freeze
  DASHBOARD_DB_NAME = "dashboard_#{Rails.env}".freeze

  # Connection to read from Pegasus production database.
  MAX_EXECUTION_TIME_SEC = 1800.seconds
  PEGASUS_DB_READER ||= sequel_connect(
    CDO.pegasus_db_reader,
    CDO.pegasus_db_reader,
    query_timeout: MAX_EXECUTION_TIME_SEC
  )

  # Connection to write to Pegasus production database.
  PEGASUS_DB_WRITER ||= sequel_connect(
    CDO.pegasus_db_writer,
    CDO.pegasus_db_reader,
    query_timeout: MAX_EXECUTION_TIME_SEC
  )

  # Connection to read from Dashboard reporting database.
  DASHBOARD_DB_READER ||= sequel_connect(
    CDO.dashboard_db_reader,
    CDO.dashboard_db_reader,
    query_timeout: MAX_EXECUTION_TIME_SEC
  )

  def self.create_tables
    # Create crv2_daily table that partition by (date + source table). Index on (email + source + date)
    # PEGASUS_DB_WRITER.table_exists?(:crv2_daily)
    # PEGASUS_DB_WRITER.schema(:crv2_daily)
    # PEGASUS_DB_WRITER[:crv2_daily].count
    # PEGASUS_DB_WRITER[:crv2_daily].all
    # PEGASUS_DB_WRITER.drop_table(:crv2_daily)

    if PEGASUS_DB_WRITER.table_exists?(:crv2_daily)
      p "crv2_daily table already exists"
    else
      PEGASUS_DB_WRITER.create_table :crv2_daily do
        primary_key :id
        String :email, null: false
        String :source_table, null: false
        String :data
        Date :data_date, null: false
        DateTime :created_at, null: false

        index :email
        index [:source_table, :data_date]
        unique [:email, :source_table, :data_date]
      end
      p "created crv2_daily table"
    end

    # Create crv2_all table, index on email. (optimization: index/partition by data_date)
    # PEGASUS_DB_WRITER.drop_table(:crv2_all)
    # PEGASUS_DB_WRITER.schema(:crv2_all)

    if PEGASUS_DB_WRITER.table_exists?(:crv2_all)
      p "crv2_all table already exists"
    else
      PEGASUS_DB_WRITER.create_table :crv2_all do
        primary_key :id
        String :email, null: false
        String :data_final
        String :data
        DateTime :data_date, null: false
        Integer :pardot_id
        DateTime :pardot_sync_at
        DateTime :created_at, null: false
        DateTime :updated_at, null: false

        unique :email
      end
      p "created crv2_all table"
    end

    # TODO: Create tracker tables:
    # Job tracker: What runs, when, result
    # Data tracker: table, data_package, date added, date last updated, number of updates
  end

  def self.empty_tables
    PEGASUS_DB_WRITER.run("delete from crv2_daily")
    PEGASUS_DB_WRITER.run("delete from crv2_all")
  end

  def self.count_table_rows
    p "crv2_daily total row count = #{PEGASUS_DB_WRITER[:crv2_daily].count}"
    p "crv2_all total row count = #{PEGASUS_DB_WRITER[:crv2_all].count}"
  end

  def self.collect_data_to_crv2_daily
    collect_changes_in_users
  end

  # TODO: generalize this function to collect_changes_in_table(table_name)
  def self.collect_changes_in_users
    updated_date_query = <<-SQL.squish
      select distinct DATE(updated_at) as updated_date
      from users_view
      order by updated_date
    SQL

    # get latest processed date. save it to tracker table to retrieve later
    processed_date = Date.new(2019, 9, 15)
    p "last processed_date = #{processed_date}"

    DASHBOARD_DB_READER[updated_date_query].each do |row|
      date = row[:updated_date]
      next if date < processed_date

      collect_daily_changes_in_users(date)
      processed_date = date
      # update trackers
    end
  end

  # TODO: generalize this to collect_daily_changes_in_table(table_name)
  def self.collect_daily_changes_in_users(date)
    logs = []
    src_table = "#{DASHBOARD_DB_NAME}.users_view"
    logs << "date = #{date}"

    # select daily data from users table. Can use temporary table
    daily_changes_query = <<-SQL.squish
      select email, user_type, school
      from #{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "daily_changes_query = #{daily_changes_query}"
    rows_to_insert = DASHBOARD_DB_READER[daily_changes_query].count
    logs << "number of rows to insert = #{rows_to_insert}"

    # insert daily changes into crv2_daily
    insert_daily_changes_query = <<-SQL.squish
      insert into crv2_daily (email, source_table, data, data_date, created_at)
      select email, '#{src_table}', JSON_OBJECT('user_type', user_type, 'school', school), '#{date}', NOW()
      from #{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "insert_daily_changes_query = #{insert_daily_changes_query}"

    before_count = PEGASUS_DB_WRITER[:crv2_daily].count
    logs << "crv2_daily row count before insert = #{before_count}"

    PEGASUS_DB_WRITER.run(insert_daily_changes_query)

    after_count = PEGASUS_DB_WRITER[:crv2_daily].count
    logs << "crv2_daily row count after insert = #{after_count}"
    logs << "Expect to insert #{rows_to_insert} rows. Actual rows inserted = #{after_count - before_count}"

    if rows_to_insert != after_count - before_count
      raise "Mismatch number of rows inserted!"
    end
  rescue StandardError => e
    p "Caught error: #{e.message}. Will save to tracker table with logs"
  ensure
    p "_____collect_daily_changes_in_users_____"
    logs.each {|log| p log}
  end

  # TODO: generalize to delete_daily_changes_from_table(table_name)
  def self.delete_daily_changes_from_users(date)
    logs = []
    logs << "date = #{date}"
    src_table = "#{DASHBOARD_DB_NAME}.users_view"

    count_rows_to_delete = <<-SQL.squish
      select count(*)
      from crv2_daily
      where source_table = '#{src_table}' and data_date = '#{date}'
    SQL
    logs << "count_rows_to_delete = #{count_rows_to_delete}"

    delete_query = <<-SQL.squish
      delete from crv2_daily
      where source_table = '#{src_table}' and data_date = '#{date}'
    SQL
    logs << "delete_query = #{delete_query}"

    logs << "row count before delete = #{PEGASUS_DB_WRITER[count_rows_to_delete].first.values}"

    PEGASUS_DB_WRITER.run(delete_query)

    logs << "row count after delete = #{PEGASUS_DB_WRITER[count_rows_to_delete].first.values}"

    # TODO: add assertion/raise
    # raise "Mismatch number of rows deleted" if row count after delete > 0, or it deletes more than it shoul
  ensure
    p "_____delete_daily_changes_from_users_____"
    logs.each {|log| p log}
  end

  def self.update_data_to_crv2_all
    unless PEGASUS_DB_WRITER[:crv2_daily].first
      p "crv2_daily is empty. stop processing"
      return
    end

    # find all packages to insert. Each daily package is defined by source_table and data_date
    # TODO: collapse daily data? Each data package is defined only by data_date
    package_query = <<-SQL.squish
      select distinct source_table, data_date
      from crv2_daily
      order by data_date, source_table
    SQL

    PEGASUS_DB_WRITER[package_query].each do |row|
      source_table, data_date = row.values_at(:source_table, :data_date)
      update_daily_data_to_crv2_all source_table, data_date
    end
  end

  # TODO: WIP
  def self.update_daily_data_to_crv2_all(source_table, data_date)
    p "_____update_daily_data_to_crv2_all_____"
    p "source_table = #{source_table}; data_date = #{data_date}"

    data_to_insert_query = <<-SQL.squish
      select * from crv2_daily
      where source_table = '#{source_table}' and data_date = '#{data_date}'
    SQL
    p data_to_insert_query

    # crv2_daily left outer join to crv2_all on email
    # merge crv2_daily.data & crv2_all.data
    # update crv2_all.data

    # join_query = <<-SQL.squish
    #   select crv2_daily.email, crv2_daily.data, crv2_all.data as crv2_all_data
    #   from crv2_daily
    #   left outer join crv2_all
    #   on crv2_daily.email = crv2_all.email
    # SQL
    #
    # PEGASUS_DB_WRITER[join_query].to_a
    # PEGASUS_DB_WRITER[:crv2_daily].left_outer_join(:crv2_all, email: :email).sql
    # PEGASUS_DB_WRITER[:crv2_daily].join(:crv2_all, email: :email).sql
  end

  def self.sync_to_pardot
  end

  def self.main
    create_tables

    # Insert daily changes to crv2_daily
    #   Get emails from user_view table
    #   Get opted_out from pegasus.contacts
    #   Get opt_in from dashboard.email_preferences
    collect_data_to_crv2_daily

    # Pull 1-day data from crv2_daily to crv2_all
    # Ruby approach:
    #   Process 1 row in daily table at a time.
    #   Find the corresponding row in crv2_all and update it or insert it
    # SQL approach:
    #   Condense daily changes to an email to 1 row.
    #   Join condensed table to crv2_all and update crv2_all data
    # Optimization:
    #   Normalize email to id?
    update_data_to_crv2_all

    # Get latest pardot id for email
    # Sync new changes to pardot
    # Get pardot id for the new records
    sync_to_pardot
  end

  def self.test
    create_tables
    empty_tables
    collect_data_to_crv2_daily
    update_data_to_crv2_all
    count_table_rows
    nil
  end
end
