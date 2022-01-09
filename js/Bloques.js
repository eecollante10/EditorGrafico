var bloques = [];
var id_inc = 1;

const darBloque = function (id, titulo, icono, descripcion, entradas, salidas) {
  return {
    id: id,
    titulo: titulo,
    icono: icono,
    descripcion: descripcion,
    hijos: [],
    darValor: function () {
      return parseInt(this.valor);
    },
    entradas: entradas,
    salidas: salidas,
  };
};

//---------
// Numero
//---------

const NumeroData = {
  ...darBloque(1, "Número", "=", "Sostiene un número para usarlo con otros bloques", 0, 1),
  valor: 0
}

const darNumero = function () {
  var numero = {
    ...NumeroData,
    id: id_inc++
  };
  bloques.push(numero);
  return numero;
};


var Numero = Vue.component("Numero", {
  data: function () {
    return bloques[bloques.length - 1];
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <div><input type="number" df-valor></div>
                  </div>
                  `,
});

//-----------
// Operador
//-----------

var Operador = Vue.component("Operador", {
  data: function () {
    return bloques[bloques.length - 1];
  },
  computed: {
    valor: function () {
      return this.darValor();
    },
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <div><input type="text" readonly df-valor v-model="valor"></div>
                  </div>
                  `,
});


const darOperador = function (data) {
  var op = {
    ...data,
    id: id_inc++
  };
  bloques.push(op);
  return op;
}

//--------
// Suma
//--------

const SumaData = {
  ...darBloque(2, "Suma", "+", "Suma dos números", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() + this.hijos[1].darValor();
    } else if (this.hijos.length == 1) {
      return this.hijos[0].darValor()
    } else
      return 0;
  }
};


//---------
// Resta
//---------

const RestaData = {
  ...darBloque(3, "Resta", "-", "Resta dos números", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() - this.hijos[1].darValor();
    } else
      return 0;
  }
};

//---------
// Multiplicacion
//---------

const MultipData = {
  ...darBloque(4, "Multiplicación", "x", "Multiplica dos números", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() * this.hijos[1].darValor();
    } else
      return 0;
  }
};


//---------
// Division
//---------

const DivisionData = {
  ...darBloque(5, "División", "÷", "Divide dos números", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() / this.hijos[1].darValor();
    } else
      return 0;
  }
};
