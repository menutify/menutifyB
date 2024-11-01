Los **hooks** en **Sequelize** son parte del ciclo de vida de los modelos, y puedes colocarlos directamente en la definición de tus modelos o en archivos de configuración donde defines tus modelos y relaciones. Te mostraré dónde y cómo puedes añadir los hooks en tu API para que, al eliminar registros, también se eliminen las imágenes de **S3**.

### 1. **Agregar hooks a los modelos**

Si tienes una estructura donde defines tus modelos en archivos separados, puedes colocar los hooks directamente en los archivos de modelo, como por ejemplo en el archivo donde defines tu modelo `Categoria`, `Hotel` o cualquier otro que necesite este comportamiento. Normalmente, esto se hace en el mismo lugar donde defines las relaciones y los atributos del modelo.

#### Ejemplo de estructura de directorios:

```
/models
    /usuario.js
    /hotel.js
    /categoria.js
```

### 2. **Agregar el hook en el modelo (ejemplo con `Categoria`)**

Aquí te muestro cómo hacerlo en el archivo de modelo:

#### Ejemplo `categoria.js`:

```javascript
const { Model, DataTypes } = require('sequelize');
const AWS = require('aws-sdk');

// Configurar AWS para interactuar con S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1' // Cambia a la región de tu bucket
});

const s3 = new AWS.S3();

// Función para eliminar imagen en S3
const deleteImageFromS3 = async (key) => {
  const params = {
    Bucket: 'nombre-de-tu-bucket',
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`Imagen ${key} eliminada de S3`);
  } catch (error) {
    console.error(`Error al eliminar imagen ${key} de S3:`, error);
  }
};

// Definir el modelo Categoria
module.exports = (sequelize) => {
  class Categoria extends Model {}

  Categoria.init({
    nombreCategoria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imagenUrl: {
      type: DataTypes.STRING, // Aquí se almacena la URL de la imagen en S3
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Categoria',
  });

  // Hook para eliminar imagen después de eliminar el registro
  Categoria.afterDestroy(async (categoria, options) => {
    if (categoria.imagenUrl) {
      const imagenKey = categoria.imagenUrl.split('/').pop();  // Obtener el nombre del archivo desde la URL
      await deleteImageFromS3(imagenKey);
    }
  });

  return Categoria;
};
```

### 3. **Agregar el hook en otros modelos (`Hotel`, `Usuario`, etc.)**

Este mismo patrón se aplica a otros modelos como `Hotel` o `Usuario`, donde quieras que las imágenes asociadas también se eliminen. Aquí está cómo sería el archivo `hotel.js` con el hook correspondiente:

#### Ejemplo `hotel.js`:

```javascript
const { Model, DataTypes } = require('sequelize');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

const deleteImageFromS3 = async (key) => {
  const params = {
    Bucket: 'nombre-de-tu-bucket',
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`Imagen ${key} eliminada de S3`);
  } catch (error) {
    console.error(`Error al eliminar imagen ${key} de S3:`, error);
  }
};

module.exports = (sequelize) => {
  class Hotel extends Model {}

  Hotel.init({
    nombreHotel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imagenUrl: {
      type: DataTypes.STRING, // URL de la imagen en S3
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Hotel',
  });

  // Hook para eliminar imagen después de eliminar el hotel
  Hotel.afterDestroy(async (hotel, options) => {
    if (hotel.imagenUrl) {
      const imagenKey = hotel.imagenUrl.split('/').pop();  // Obtener el nombre del archivo desde la URL
      await deleteImageFromS3(imagenKey);
    }
  });

  return Hotel;
};
```

### 4. **¿Dónde se utiliza el hook?**

Los hooks como `afterDestroy` se ejecutan automáticamente cuando realizas una acción de eliminación (`destroy`) sobre un registro de esa tabla. Así que no tienes que llamar el hook directamente. 

Cuando en algún lugar de tu API haces una eliminación de un registro, el hook se activa automáticamente y ejecuta la lógica que hayas definido.

#### Ejemplo en tu API (eliminar un usuario):

Supón que en tu controlador o ruta de API tienes una lógica para eliminar un **usuario**. Este usuario tiene hoteles y esos hoteles tienen categorías con imágenes en S3.

Al hacer la eliminación del usuario, el sistema automáticamente eliminará los hoteles y las categorías (si tienes `onDelete: 'CASCADE'` configurado), y los hooks `afterDestroy` en los modelos **Hotel** y **Categoria** eliminarán las imágenes de S3.

```javascript
// Eliminar un usuario y todo lo relacionado (hoteles, categorías, imágenes)
app.delete('/usuario/:id', async (req, res) => {
  const usuarioId = req.params.id;

  try {
    // Eliminar el usuario y en cascada sus hoteles y categorías
    await Usuario.destroy({ where: { id: usuarioId } });

    res.status(200).send(`Usuario ${usuarioId} y sus datos relacionados eliminados.`);
  } catch (error) {
    res.status(500).send('Error al eliminar el usuario');
  }
});
```

### Resumen:
- **Hooks en los modelos:** Coloca los hooks `afterDestroy` en los archivos de los modelos donde tienes imágenes relacionadas con registros.
- **Eliminar en cascada:** Usa `onDelete: 'CASCADE'` para asegurarte de que las relaciones de base de datos se eliminen correctamente, y deja que los hooks eliminen las imágenes en S3.
- **Automatización:** No tienes que llamar a los hooks directamente; Sequelize los ejecutará cuando se elimine un registro.

Con este enfoque, aseguras que las imágenes en **S3** se eliminan cada vez que eliminas registros de tu base de datos, manteniendo tus archivos sincronizados y limpios. ¿Te gustaría probar esta configuración en tu API o necesitas más detalles?