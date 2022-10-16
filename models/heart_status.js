import Sequelize from "sequelize";

export default class heart_status extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        service_id: Sequelize.INTEGER,
        service_port: Sequelize.STRING,
        service_desc: Sequelize.STRING,
        service_status: Sequelize.BOOLEAN,
        heart_post_count: Sequelize.INTEGER,
      },
      {
        sequelize,
        modelName: "Heart_Status",
        tableName: "heart_statuses",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
}
