import { DataTypes } from 'sequelize'
import { defaultValueSchemable, toDefaultValue } from 'sequelize/lib/utils'

export const createModels = async (conexion) => {
  const user = conexion.define(
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

  conexion.define('invited_code', {
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

  conexion.define('menu', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  })

  conexion.define('url', {
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

  conexion.define('categories', {
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

  conexion.define('logo', {
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

  conexion.define('favs', {
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

  conexion.define('subs', {
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

  conexion.define('food', {
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

  //   console.log(user === conexion.models.user)
}
