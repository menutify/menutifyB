import { DataTypes, Sequelize } from 'sequelize'
import { defaultValueSchemable, toDefaultValue } from 'sequelize/lib/utils'
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
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM,
      values: ['admin', 'user'],
      defaultValue: 'user', // Valor por defecto es 'viewer'
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_invitedCode: {
      type: DataTypes.INTEGER
    }
  },
  {
    // modelName: 'User'
    //   freezeTableName: true
  }
)

/**
 * invited_code:
 * contiene el codigo y el estado
 * si es false, no esta usado
 * si es true, esta usado
 */

const invitedCode = sqConexion.define('invited_code', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id_user: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
})

const menu = sqConexion.define('menu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bg_color: { type: DataTypes.BOOLEAN, defaultValue: false },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

const url = sqConexion.define('url', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_menu: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

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

  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

const logo = sqConexion.define('logo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_menu: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  img: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

const favs = sqConexion.define('favs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_menu: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_food: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
})

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
  }
})

const food = sqConexion.define('food', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_menu: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  img: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

//   console.log(user === sqConexion.models.user)
export const models = {
  logo,
  menu,
  user,
  categories,
  sqConexion,
  favs,
  food,
  subs,
  url,
  invitedCode
}
