# Foorm Library Editor is only available on levelbuilder or test, for those with levelbuilder permissions.
class FoormLibraryEditorController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
  before_action :authenticate_user!
  authorize_resource class: false

  # GET '/foorm/library_editor/'
  def index
    formatted_names_and_versions = Foorm::LibraryQuestion.all.map {|library_question| {name: library_question.library_name, version: library_question.library_version}}.uniq
    formatted_names_and_versions.sort_by! {|library| library[:name]}
    categories = []

    @script_data = {
      props: {
        formNamesAndVersions: formatted_names_and_versions,
        formCategories: categories
      }.to_json
    }

    render 'foorm/library_editor/index'
  end
end
