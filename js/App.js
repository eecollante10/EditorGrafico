var app = new Vue({
  el: "#main",
  data: {
    bloques: dataBloques,
  },
  mounted: function () {
    // `this` points to the vm instance
    var id = document.getElementById("drawflow");
    this.editor = new Drawflow(id, Vue, this);
    this.editor.registerNode("Asignacion", Asignacion);
    this.editor.registerNode("Variable", Variable);
    this.editor.registerNode("Operador", Operador);
    this.editor.on("connectionCreated", function (params) {
      var bloqueOut = bloques[params.output_id - 1];
      var bloqueIn = bloques[params.input_id - 1];

      switch (bloqueIn.icono) {
        case "=":
          bloqueIn.asignar(bloqueOut.darValor());
          break;
        default:
          if (params.input_class.slice(-1) == 1) {
            bloqueIn.hijos.splice(0, 0, bloqueOut);
          } else {
            bloqueIn.hijos.splice(1, 0, bloqueOut);
          }
          break;
        
      }
    });
    this.editor.start();
  },
  methods: {
    crearBloque: function (bloque) {
      var data;
      var componente = "Operador";
      switch (bloque.id) {
        case 0:
          data = darNodo(AsignacionData);
          componente = "Asignacion";
          break;
        case -1:
          data = darNodo(TextoData);
          componente = "Variable";
          break;
        case 1:
          data = darNodo(NumeroData);
          componente = "Variable";
          break;
        case 2:
          data = darNodo(SumaData);
          break;
        case 3:
          data = darNodo(RestaData);
          break;
        case 4:
          data = darNodo(MultipData);
          break;
        case 5:
          data = darNodo(DivisionData);
          break;
        case 6:
          data = darNodo(IgualData);
          break;
        case 7:
          data = darNodo(DiferenteData);
          break;
        case 8:
          data = darNodo(MayorData);
          break;
        case 9:
          data = darNodo(OrData);
          break;
        case 10:
          data = darNodo(AndData);
          break;
      }
      this.editor.addNode(
        data.titulo,
        bloque.entradas,
        bloque.salidas,
        0,
        0,
        "Class",
        data,
        componente,
        "vue"
      );
    },
  },
});