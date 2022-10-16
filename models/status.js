import Sequelize from "sequelize";

export default class status extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        host_name: Sequelize.STRING,
        host_ip: Sequelize.STRING,
        desc: Sequelize.STRING,
        server_status: Sequelize.BOOLEAN,
        post_count: Sequelize.INTEGER,
      },
      {
        sequelize,
        modelName: "Status",
        tableName: "statuses",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
}
