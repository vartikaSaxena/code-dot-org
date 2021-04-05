# == Schema Information
#
# Table name: scripts_student_resources
#
#  id          :bigint           not null, primary key
#  script_id   :integer
#  resource_id :integer
#
class ScriptsStudentResource < ApplicationRecord
  belongs_to :script
  belongs_to :resource
end
