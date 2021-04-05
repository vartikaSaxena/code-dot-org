# == Schema Information
#
# Table name: unit_group_student_resources
#
#  id            :bigint           not null, primary key
#  unit_group_id :integer
#  resource_id   :integer
#
class UnitGroupStudentResource < ApplicationRecord
  belongs_to :unit_group
  belongs_to :resource
end
