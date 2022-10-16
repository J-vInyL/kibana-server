import Sequelize from "sequelize";

export default class file extends Sequelize.Model {
   static init(sequelize) {
    return super.init(
      {
        file_name:Sequelize.STRING,
        file_path: Sequelize.STRING,
        history_id: Sequelize.INTEGER,
	pid: Sequelize.INTEGER
      },
      {
        sequelize,
        modelName: "File",
        tableName: "files",
        charset: "utf8",
        collate: "utf8_general_ci"
      }
    );
  }
}
