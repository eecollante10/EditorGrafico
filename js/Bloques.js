var bloques = [];
var dataBloques = [];
var id_inc = 1;
var variables = {};

const darBloque = function (id, titulo, icono, descripcion, entradas, salidas) {
  return {
    id: id,
    titulo: titulo,
    icono: icono,
    descripcion: descripcion,
    hijos: [],
    entradas: entradas,
    salidas: salidas,
  };
};

const darNodo = function (data) {
  var op = {
    ...data,
    id: id_inc++
  };
  bloques.push(op);
  return op;
}

//---------
// Asignación
//---------

const AsignacionData = {
  ...darBloque(0, "Asignación", "=", "Sostiene un número o texto en una variable", 1, 0),
  valor: "",
  nombre: "",
  asignar: function(v){
    console.log("asignado: " + this.nombre + " a : " +v);
    this.valor = v;
    variables[this.nombre] = v;
  }
}

dataBloques.push(AsignacionData);


var Asignacion = Vue.component("Asignacion", {
  data: function () {
    return bloques[bloques.length - 1];
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <div>Nombre: <input type="text" df-nombre></div>
                      <div> = <input type="text" df-valor readonly v-model="valor"></div> 
                  </div>
                  `,
});

//---------
// Variable
//---------

var Variable = Vue.component("Variable", {
  data: function () {
    return bloques[bloques.length - 1];
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <div>
                        <input type="text" df-valor v-if="titulo == 'Texto'">
                        <input type="number" df-valor v-else>
                      </div>
                  </div>
                  `,
});

//---------
// Numero
//---------

const NumeroData = {
  ...darBloque(1, "Número", "º", "Sostiene un número para usarlo con otros bloques", 0, 1),
  valor: 0,
  darValor: function () {
    return parseInt(this.valor);
  }
}

dataBloques.push(NumeroData);

//---------
// Texto
//---------

const TextoData = {
  ...darBloque(-1, "Texto", "ABC", "Sostiene texto para usarlo con otros bloques", 0, 1),
  valor: "",
  darValor: function(){
    return this.valor;
  }
}

dataBloques.push(TextoData);

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


//--------
// Suma
//--------

const SumaData = {
  ...darBloque(2, "Suma", "+", "Suma dos números, o concatena dos textos o un número con un texto", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() + this.hijos[1].darValor();
    } else if (this.hijos.length == 1) {
      return this.hijos[0].darValor()
    } else
      return 0;
  }
};

dataBloques.push(SumaData)

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

dataBloques.push(RestaData);

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

dataBloques.push(MultipData);

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

dataBloques.push(DivisionData);

//---------
// Igual ?
//---------

const IgualData = {
  ...darBloque(6, "Igual Que", "==", "Verdadero, si los dos valores son iguales", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() == this.hijos[1].darValor();
    } else
      return false;
  }
};

dataBloques.push(IgualData);

//---------
// Diferente ?
//---------

const DiferenteData = {
  ...darBloque(7, "Diferente Que", "!=", "Verdadero, si los dos valores son diferentes", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() != this.hijos[1].darValor();
    } else
      return false;
  }
};

dataBloques.push(DiferenteData);

//---------
// Mayor Que ?
//---------

const MayorData = {
  ...darBloque(8, "Mayor Que", ">", "Verdadero, si el primer valor es mayor que el segundo", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() > this.hijos[1].darValor();
    } else
      return false;
  }
};

dataBloques.push(MayorData);

//---------
// Or Que ?
//---------

const OrData = {
  ...darBloque(9, "O Booleano", "||", "Verdadero, si alguno de los dos valores es verdadero", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() || this.hijos[1].darValor();
    } else
      return false;
  }
};

dataBloques.push(OrData);

//---------
// Y Que ?
//---------

const AndData = {
  ...darBloque(10, "Y Booleano", "&&", "Verdadero, si los dos valores son verdaderos", 2, 1),
  darValor: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darValor() && this.hijos[1].darValor();
    } else
      return false;
  }
};

dataBloques.push(AndData);
