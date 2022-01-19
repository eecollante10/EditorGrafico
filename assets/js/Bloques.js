var bloques = [];
var dataBloques = [];
var id_inc = 1;
var ultimo_id_creado = 0
var cargando = false
var indice_carga = 0

const darBloque = function (id, titulo, icono, descripcion, entradas, salidas) {
  return {
    id: id,
    titulo: titulo,
    icono: icono,
    descripcion: descripcion,
    entradas: entradas,
    salidas: salidas,
    esRaiz: true
  };
};

const darNodo = function (data) {
  var op = {
    ...data,
    id: id_inc++,
    hijos: [],
    nivel: 1
  };
  bloques.push(op);
  return op;
}

//---------
// bloque de código
//---------
const BlockData = {
  ...darBloque(-3, "Bloque De Código", "{}", "Puede contener varias líneas de código", 1, 1),
  darValor: function () {},
  darPython: function () {
    var codigo = "";
    for (hijo of this.hijos) {
      codigo += indentacion(this.nivel);
      codigo += undefined + "\n";
    }
    return codigo;
  }
};

dataBloques.push(BlockData);

//---------
// Asignación
//---------

const AsignacionData = {
  ...darBloque(0, "Asignación", "=", "Sostiene un número o texto en una variable", 1, 1),
  nombre: "",
  asignar: function (bloque) {
    this.hijos.push(bloque);
  },
  darValor: function () {
    if (this.hijos.length > 0) {
      return this.hijos[0].darValor();
    }
  },
  darPython: function () {
    if (this.hijos.length > 0) {
      return this.nombre + " = " + this.hijos[0].darPython();
    }
  }
}

dataBloques.push(AsignacionData);


var Asignacion = Vue.component("Asignacion", {
  data: function () {
    var indice = cargando ? indice_carga : bloques.length - 1;
    if (cargando) indice_carga++;
    var bloque = bloques[indice];
    bloque.asignar = function (bloque) {
      this.hijos.push(bloque);
    };
    bloque.darValor = function () {
      if (this.hijos.length > 0) {
        return this.hijos[0].darValor();
      }
    };
    bloque.darPython = function () {
      if (this.hijos.length > 0) {
        return this.nombre + " = " + this.hijos[0].darPython();
      }
    };
    return bloque;
  },
  computed: {
    valor: function () {
      if (this.hijos.length > 0) {
        return this.hijos[0].darValor();
      }
    }
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
    var indice = cargando ? indice_carga : bloques.length - 1;
    if (cargando) indice_carga++;
    var bloque = bloques[indice];
    bloque.nombre = "";
    bloque.darValor = function(){
      return this.valor;
    }
    bloque.darPython = function(){
      return this.nombre;
    }
    return bloque;
  },
  props: ["variables"],
  computed: {
    seleccion: function () {
      var bloque = this.variables.find(function (element) {
        return element.nombre == this.nombre;
      }, this);
      if (bloque === undefined) {
        this.valor = "";
        this.nombre = "";
      } else
        this.valor = bloque.darValor();
      return this.valor
    },
    nombreVariables: function () {
      return this.variables.map(function (element) {
        return element.nombre;
      });
    }
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <select v-model="nombre">
                        <option v-for="variable in nombreVariables" v-bind:value="variable">
                          {{ variable }}
                        </option>
                      </select>
                      <input type="text" df-seleccion readonly v-model="seleccion">
                  </div>
                  `,
});

const VariableData = {
  ...darBloque(-2, "Variable", "var", "Sostiene una de las variables asignadas con = para usar con otros bloques", 0, 1),
  valor: 0,
  darValor: function () {
    return this.valor;
  },
  darPython: function () {
    return this.nombre;
  }
}

dataBloques.push(VariableData);

//---------
// Numero
//---------

var Numero = Vue.component("Numero", {
  data: function () {
    var indice = cargando ? indice_carga : bloques.length - 1;
    if (cargando) indice_carga++;
    var bloque = bloques[indice];
    bloque.darValor = function () {
      return parseInt(this.valor);
    }
    bloque.darPython = function () {
      return this.valor;
    }
    return bloque;
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <div>
                        <input type="number" df-valor v-model="valor">
                      </div>
                  </div>
                  `,
});

const NumeroData = {
  ...darBloque(1, "Número", "º", "Sostiene un número para usarlo con otros bloques", 0, 1),
  valor: 0,
  darValor: function () {
    return parseInt(this.valor);
  },
  darPython : function () {
    return this.valor;
  }
}

dataBloques.push(NumeroData);

//---------
// Texto
//---------

var Texto = Vue.component("Texto", {
  data: function () {
    var indice = cargando ? indice_carga : bloques.length - 1;
    if (cargando) indice_carga++;
    var bloque = bloques[indice];
    bloque.darValor = function () {
      return this.valor;
    };
    bloque.darPython = function () {
      return '"' + this.valor + '"';
    }
    return bloque;
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <div>
                        <input type="text" df-valor v-model="valor">
                      </div>
                  </div>
                  `,
});

const TextoData = {
  ...darBloque(-1, "Texto", "ABC", "Sostiene texto para usarlo con otros bloques", 0, 1),
  valor: "",
}

dataBloques.push(TextoData);

//-----------
// Operador
//-----------

var Operador = Vue.component("Operador", {
  data: function () {
    var indice = cargando ? indice_carga : bloques.length - 1;
    if (cargando) indice_carga++;
    var bloque = bloques[indice];
    switch (bloque.icono) {
      case "+":
        bloque.darValor = SumaData.darValor;
        bloque.darPython = SumaData.darPython;
        break;
      case "-":
        bloque.darValor = RestaData.darValor
        bloque.darPython = RestaData.darPython
        break;
      case "x":
        bloque.darValor = MultipData.darValor
        bloque.darPython = MultipData.darPython
        break;
      case "÷":
        bloque.darValor = DivisionData.darValor
        bloque.darPython = DivisionData.darPython
      case "==":
        bloque.darValor = IgualData.darValor
        bloque.darPython = IgualData.darPython
        break;
      case "!=":
        bloque.darValor = NotData.darValor
        bloque.darPython = NotData.darPython
        break;
      case ">":
        bloque.darValor = MayorData.darValor
        bloque.darPython = MayorData.darPython
        break;
      case "||":
        bloque.darValor = OrData.darValor
        bloque.darPython = OrData.darPython
        break;
      case "&&":
        bloque.darValor = AndData.darValor
        bloque.darPython = AndData.darPython
        break;
      case "!":
        bloque.darValor = NotData.darValor
        bloque.darPython = NotData.darPython
        break;
      case "if":
        bloque.darValor = IteData.darValor
        bloque.darPython = IteData.darPython
        break;
      case "for":
        bloque.darValor = ForData.darValor
        bloque.darPython = ForData.darPython
        break;
      case "print":
        bloque.darValor = PrintData.darValor
        bloque.darPython = PrintData.darPython
        break;
    }
    return bloque;
  },
  computed: {
    valor: function () {
      return this.darValor();
    },
  },
  template: `<div>
                      <h4>{{titulo}}</h4>
                      <div v-show="icono !== 'for'"><input type="text" readonly df-valor v-model="valor"></div>
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return "(" + this.hijos[0].darPython() + " + " + this.hijos[1].darPython() + ")";
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return "(" + this.hijos[0].darPython() + " - " + this.hijos[1].darPython() + ")";
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darPython() + " * " + this.hijos[1].darPython();
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darPython() + " / " + this.hijos[1].darPython();
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darPython() + " == " + this.hijos[1].darPython();
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darPython() + " != " + this.hijos[1].darPython();
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darPython() + " > " + this.hijos[1].darPython();
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darPython() + " or " + this.hijos[1].darPython();
    }
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
  },
  darPython: function () {
    if (this.hijos.length == 2) {
      return this.hijos[0].darPython() + " and " + this.hijos[1].darPython();
    }
  }
};

dataBloques.push(AndData);

//---------
// Not
//---------

const NotData = {
  ...darBloque(11, "Not Booleano", "!", "Invierte un valor booleano", 1, 1),
  darValor: function () {
    if (this.hijos.length == 1) {
      return !this.hijos[0].darValor();
    }
  },
  darPython: function () {
    if (this.hijos.length == 1) {
      return "!" + this.hijos[0].darPython();
    }
  }
};

dataBloques.push(NotData);

//---------
// Ite
//---------

const IteData = {
  ...darBloque(12, "if then else", "if", "Estructura de control", 3, 1),
  darValor: function () {
    if (this.hijos.length >= 2 && this.hijos[0].darValor()) {
      return this.hijos[1].darValor();
    } else if (this.hijos.length == 3)
      return this.hijos[2].darValor();
  },
  darPython: function () {
    var resultado = "";
    if (this.hijos.length >= 2) {
      resultado += "if " + this.hijos[0].darPython() + ":\n";
      if (this.hijos[1].icono == "{}") {
        resultado += this.hijos[1].darPython();
      } else {
        resultado += "  " + this.hijos[1].darPython() + "\n";
      }
    }
    if (this.hijos.length == 3) {
      if (this.hijos[2].icono == "{}") {
        resultado += "else:\n" + this.hijos[2].darPython();
      } else {
        resultado += "else:\n"
        resultado += indentacion(this.nivel);
        resultado += this.hijos[2].darPython();
      }
    }
    return resultado;
  }
};

dataBloques.push(IteData);


//---------
// For
//---------

const ForData = {
  ...darBloque(13, "for", "for", "Estructura de control", 3, 1),
  darValor: function () {},
  darPython: function () {
    var resultado = "";
    if (this.hijos.length == 3) {
      resultado += "for i in range(" + this.hijos[0].darPython() + ", " + this.hijos[1].darPython() + "):\n";
      if (this.hijos[2].icono == "{}") {
        resultado += this.hijos[2].darPython();
      } else {
        resultado += indentacion(this.nivel);
        resultado += this.hijos[2].darPython() + " \n";
      }
    }
    return resultado;
  }
};

dataBloques.push(ForData);

//---------
// print
//---------

const PrintData = {
  ...darBloque(14, "Decir", "print", "Imprime lo que haya en el nodo de entrada", 1, 1),
  darValor: function () {
    if (this.hijos.length == 1) {
      return this.hijos[0].darValor();
    }
  },
  darPython: function () {
    if (this.hijos.length == 1) {
      return "print( " + this.hijos[0].darPython() + " )";
    }
  }
};

dataBloques.push(PrintData);

//--------- funcion

function indentacion(nivel) {
  const ind = "    ";
  var res = "";
  for (var i = 0; i < nivel; i++) {
    res += ind;
  }
  return res;
}