import { DataTypes, Sequelize } from 'sequelize'

import sqConexion from '../database/sqConexion.js'

const user = sqConexion.define(
  'user',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4, // Genera un UUID automáticamente
      allowNull: false,
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
    img: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    country: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    token: {
      type: DataTypes.STRING
    }
  },
  {
    // modelName: 'User'
    //   freezeTableName: true
  }
)

const subs = sqConexion.define('subs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.UUID,
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

user.hasOne(subs, { foreignKey: 'id_user', onDelete: 'CASCADE' })
subs.belongsTo(user, { foreignKey: 'id_user' })

const restaurant = sqConexion.define('restaurant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_user: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  desc: { type: DataTypes.TEXT, defaultValue: '' },
  address: { type: DataTypes.STRING, defaultValue: '' },
  number: { type: DataTypes.STRING, defaultValue: '' },
  currency: { type: DataTypes.STRING, defaultValue: 'ARS' },
  send_method: { type: DataTypes.STRING, defaultValue: '' },
  days: { type: DataTypes.JSON, defaultValue: [] },
  hour: { type: DataTypes.JSON, defaultValue: ['00:00', '00:00'] },

  logo_url: { type: DataTypes.STRING, defaultValue: '' },

  state: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
})

user.hasOne(restaurant, { foreignKey: 'id_user', onDelete: 'CASCADE' })
restaurant.belongsTo(user, { foreignKey: 'id_user' })

const menus = sqConexion.define('menus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_restaurant: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  f_color: { type: DataTypes.BOOLEAN, defaultValue: false },
  s_color: { type: DataTypes.STRING, defaultValue: '' },
  domain: {
    type: DataTypes.STRING,
    unique: true
  },
  header_url: { type: DataTypes.STRING, defaultValue: '' },
  state: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
})

restaurant.hasMany(menus, { foreignKey: 'id_restaurant', onDelete: 'CASCADE' })
menus.belongsTo(restaurant, { foreignKey: 'id_restaurant' })

const categories = sqConexion.define('categories', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_menu: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
})

menus.hasMany(categories, { foreignKey: 'id_menu', onDelete: 'CASCADE' })
categories.belongsTo(menus, { foreignKey: 'id_menu' })

const categoriesDetails = sqConexion.define('categoriesDetails', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cat: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  desc: { type: DataTypes.STRING, defaultValue: '' }
})

categories.hasOne(categoriesDetails, {
  foreignKey: 'id_cat',
  onDelete: 'CASCADE'
})
categoriesDetails.belongsTo(categories, { foreignKey: 'id_cat' })

const food = sqConexion.define('food', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cat: { type: DataTypes.INTEGER, allowNull: false },
  state: { type: DataTypes.BOOLEAN, allowNull: false },
  pos: { type: DataTypes.INTEGER, allowNull: false }
})

categories.hasMany(food, { foreignKey: 'id_cat', onDelete: 'CASCADE' })
food.belongsTo(categories, { foreignKey: 'id_cat' })

const foodDetails = sqConexion.define('foodDetails', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_food: { type: DataTypes.INTEGER, allowNull: false },
  img: { type: DataTypes.STRING, defaultValue: '' },
  price: { type: DataTypes.DECIMAL(13,2), allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  star: { type: DataTypes.BOOLEAN, defaultValue: false },
  desc: { type: DataTypes.STRING, defaultValue: '' }
})

food.hasOne(foodDetails, {
  foreignKey: 'id_food',
  onDelete: 'CASCADE'
})
foodDetails.belongsTo(food, { foreignKey: 'id_food' })

// menus.hasMany(food, { foreignKey: 'id_menu', onDelete: 'CASCADE' })
// food.belongsTo(menus, { foreignKey: 'id_menu' })

// categories.hasMany(food, { foreignKey: 'id_cats', onDelete: 'CASCADE' })
// food.belongsTo(categories, { foreignKey: 'id_cats' })

//   console.log(user === sqConexion.models.user)
export const models = {
  sqConexion,
  menus,
  user,
  categories,
  restaurant,
  categories,
  categoriesDetails,
  food,
  foodDetails,
  subs
  // url,
  // invitedCode
}
