class CreateScriptsStudentResources < ActiveRecord::Migration[5.2]
  def change
    create_table :scripts_student_resources do |t|
      t.integer :script_id
      t.integer :resource_id

      reversible do |dir|
        dir.up do
          execute "ALTER TABLE lessons_opportunity_standards CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
        end
      end
    end
  end
end
