production
- main
- feature (new)
- hotfix (problems)
- enhancement (optim.)

status code:
- 400  bac request
- 404 no existe
- 401 dato incorrecto
- 500 error
- 200 ok
- 201 created
- 204 nocontent
- 304 no modified
-409 must be unique

const categories = await Category.findAll({
  include: [
    {
      model: Food,
      attributes: ['id', 'id_cat', 'state', 'pos'], // Solo los campos que necesitas
      include: [
        {
          model: Detail,
          attributes: ['img', 'price', 'name'], // Solo los campos que necesitas
        },
      ],
    },
  ],
  attributes: ['id', 'pos', 'name', 'id_menu'], // Solo los campos que necesitas
  order: [
    ['pos', 'ASC'], // Ordenar categorías por posición
    [Food, 'pos', 'ASC'], // Ordenar comidas por posición dentro de cada categoría
  ],
});

[
  {
    "id": 1,
    "pos": 0,
    "name": "Padre 1",
    "id_menu": 1,
    "foods": [
      {
        "id": 0,
        "id_cat": 1,
        "state": true,
        "pos": 0,
        "details": {
          "img": "asdsadasd",
          "price": "asdasdasd",
          "name": "asdasdas"
        }
      }
    ]
  }
]