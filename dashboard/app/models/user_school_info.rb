# == Schema Information
#
# Table name: user_school_infos
#
#  id                     :integer          not null, primary key
#  user_id                :integer          not null
#  start_date             :datetime         not null
#  end_date               :datetime
#  school_info_id         :integer          not null
#  last_confirmation_date :datetime         not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class UserSchoolInfo < ApplicationRecord
  validates_presence_of :user, :school_info_id, :start_date, :last_confirmation_date

  belongs_to :user
  belongs_to :school_info

  after_update :update_last_seen_school_info_interstitial, if: :update_end_date?

  def update_last_seen_school_info_interstitial
    user.update!(properties: {last_seen_school_info_interstitial: DateTime.now})
  end
end
