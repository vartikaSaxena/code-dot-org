# == Schema Information
#
# Table name: level_sources
#
#  id         :integer          not null, primary key
#  level_id   :integer
#  md5        :string(32)       not null
#  data       :string(20000)    not null
#  created_at :datetime
#  updated_at :datetime
#  hidden     :boolean          default(FALSE)
#
# Indexes
#
#  index_level_sources_on_level_id_and_md5  (level_id,md5)
#

require 'digest/md5'

# A specific solution attempt for a specific level
class LevelSource < ActiveRecord::Base
  # TODO(asher): At some point, the following string appeared in program XML.
  #   XMLNS_STRING = ' xmlns="http://www.w3.org/1999/xhtml"'
  # It remains in some old LevelSource.data. Migrate any existing LevelSource
  # with this string to a LevelSource without via
  #   data = self.data.gsub(XMLNS_STRING, '')
  # For more context, see https://github.com/code-dot-org/code-dot-org/pull/13579.
  belongs_to :level
  has_one :level_source_image
  has_many :activities

  validates_length_of :data, maximum: 20000
  validates :data, no_utf8mb4: true

  before_save :recompute_md5

  def recompute_md5
    self.md5 = Digest::MD5.hexdigest(data)
  end

  def self.cache_key(level_id, md5)
    "#{level_id}-#{md5}"
  end

  def self.find_identical_or_create(level, data)
    md5 = Digest::MD5.hexdigest(data)

    Rails.cache.fetch(cache_key(level.id, md5)) do
      LevelSource.where(level: level, md5: md5).first_or_create do |ls|
        ls.data = data
      end
    end
  end

  # @param [Integer] user_id The ID of the user performing the obfuscation.
  # @return [String] The obfuscated (with the user_id) level source ID.
  def obfuscate_level_source_id(user_id)
    Base64.urlsafe_encode64("#{id}:#{user_id}")
  end

  # @param [String] obfuscated_level_source_id_user_id The obfuscated (with the user_id)
  #   level_source ID.
  # @param [Boolean] ignore_missing_user Whether to ignore the absence of the user specified by the
  #   user ID when returning the level source ID. Default false.
  # @return [Integer, nil] The (deobfuscated) level source ID, returns nil if the user specified in
  #   the obfuscation does not exist.
  def self.deobfuscate_level_source_id(obfuscated_level_source_id_user_id, ignore_missing_user: false)
    level_source_id, user_id = Base64.urlsafe_decode64(obfuscated_level_source_id_user_id).split(':')
    if ignore_missing_user || user_id.nil? || User.find_by_id(user_id)
      return level_source_id.to_i
    end
    nil
  rescue
    return nil
  end
end
