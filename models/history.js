import Sequelize from "sequelize";

export default class history extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        history_name: Sequelize.STRING,
        server_settings: Sequelize.STRING,
        history_query: Sequelize.STRING,
        history_command: Sequelize.STRING,
        user_id: Sequelize.STRING
      },

      {
        sequelize,
        modelName: "History",
        tableName: "histories",
        charset: "utf8",
        collate: "utf8_general_ci"
      }
    );
  }
}
