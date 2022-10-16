import Sequelize from "sequelize";

export default class list extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        list_server: Sequelize.STRING,
 	history_id: Sequelize.INTEGER,

      },

      {
        sequelize,
        modelName: "List",
        tableName: "lists",
        charset: "utf8",
        collate: "utf8_general_ci"
      }
    );
  }
}
