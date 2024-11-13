import { DataTypes } from 'sequelize'

import sqConexion from '../database/sqConexion.js'

const user = sqConexion.define(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM,
      values: ['admin', 'invited', 'user'],
      defaultValue: 'user', // Valor por defecto es 'viewer'
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    new: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    subActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    session: {
      type: DataTypes.ENUM,
      values: ['normal', 'facebook', 'google'],
      defaultValue: 'normal'
    },
    country: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    code: {
      type: DataTypes.STRING
    }
  },
  {
    // modelName: 'User'
    //   freezeTableName: true
  }
)

const invitedCode = sqConexion.define('code', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // id_user: {
  //   type: DataTypes.INTEGER,
  //   defaultValue: 0
  // },
  used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,

    defaultValue: false
  }
})

user.hasMany(invitedCode, { foreignKey: 'id_user', onDelete: 'CASCADE' }) // Un usuario puede tener muchos códigos de invitación
invitedCode.belongsTo(user, { foreignKey: 'id_user' }) // Un código de invitación pertenece a un usuario

const subs = sqConexion.define('subs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_pay: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id_client_stripe: {
    type: DataTypes.STRING
  },
  c_date: {
    type: DataTypes.DATE
  },
  f_date: {
    type: DataTypes.DATE
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  type: {
    type: DataTypes.ENUM,
    values: ['1', '2', '3'],
    defaultValue: '1',
    allowNull: false
  },
  platform: {
    type: DataTypes.ENUM,
    values: ['mp', 'st'],
    defaultValue: 'mp',
    allowNull: false
  }
})

user.hasOne(subs, { foreignKey: 'id_user' })
subs.belongsTo(user, { foreignKey: 'id_user' })

const menus = sqConexion.define('menus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // id_user: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false
  // },
  bg_color: { type: DataTypes.BOOLEAN, defaultValue: false },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  state: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
})

user.hasMany(menus, { foreignKey: 'id_user', onDelete: 'CASCADE' })
menus.belongsTo(user, { foreignKey: 'id_user' })

// const url = sqConexion.define('url', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   id_menu: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   id_user: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   state: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false
//   }
//   // url: {
//   //   type: DataTypes.STRING,
//   //   allowNull: false
//   // }
// })

const categories = sqConexion.define('categories', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // id_menu: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false
  // },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

menus.hasMany(categories, { foreignKey: 'id_menu', onDelete: 'CASCADE' })
categories.belongsTo(menus, { foreignKey: 'id_menu' })

const logo = sqConexion.define('logo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // id_menu: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false
  // },

  img: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
})

menus.hasMany(logo, { foreignKey: 'id_menu', onDelete: 'CASCADE' })
logo.belongsTo(menus, { foreignKey: 'id_menu' })

const food = sqConexion.define('food', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // id_menu: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   references: {
  //     model: menus,
  //     key: id
  //   }
  // },
  // id_cat:{
  //   type:DataTypes.INTEGER,
  //   allowNull:false,
  //   references:{
  //     model:categories,
  //     key:id
  //   }
  // },
  img: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: DataTypes.DOUBLE,
  desc: DataTypes.TEXT,
  fav: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  glutenFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
})

menus.hasMany(food, { foreignKey: 'id_menu', onDelete: 'CASCADE' })
food.belongsTo(menus, { foreignKey: 'id_menu' })

categories.hasMany(food, { foreignKey: 'id_cats', onDelete: 'CASCADE' })
food.belongsTo(categories, { foreignKey: 'id_cats' })

//   console.log(user === sqConexion.models.user)
export const models = {
  logo,
  menus,
  user,
  categories,
  sqConexion,
  // favs,
  food,
  subs,
  // url,
  invitedCode
}
