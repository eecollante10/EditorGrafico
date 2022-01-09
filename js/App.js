var app = new Vue({
    el: "#main",
    data: {
      bloques: [NumeroData, SumaData, RestaData, MultipData, DivisionData],
    },
    mounted: function () {
      // `this` points to the vm instance
      var id = document.getElementById("drawflow");
      this.editor = new Drawflow(id, Vue, this);
      this.editor.registerNode("Numero", Numero);
      this.editor.registerNode("Operador", Operador);
      this.editor.on("connectionCreated", function (params) {
        var bloqueOut = bloques[params.output_id - 1];
        var bloqueIn = bloques[params.input_id - 1];

        switch (bloqueIn.icono) {
          case "-":
          case "+":
          case "x":
          case "÷":
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
        switch (bloque.id) {
          case 1:
            data = darNumero();
            break;
          case 2:
            data = darOperador(SumaData);
            break;
          case 3:
            data = darOperador(RestaData);
            break;
          case 4:
            data = darOperador(MultipData);
            break;
          case 5:
            data = darOperador(DivisionData);
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
          (bloque.id == 1 ) ? "Numero" : "Operador",
          "vue"
        );
      },
    },
  });