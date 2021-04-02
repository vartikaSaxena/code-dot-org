class CreateUnitGroupStudentResources < ActiveRecord::Migration[5.2]
  def change
    create_table :unit_group_student_resources do |t|
      t.integer :unit_group_id
      t.integer :resource_id

      reversible do |dir|
        dir.up do
          execute "ALTER TABLE lessons_opportunity_standards CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
        end
      end
    end
  end
end
