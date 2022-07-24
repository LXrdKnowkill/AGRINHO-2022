class PauseMenu {
  constructor({progress, onComplete}) {
    this.progress = progress;
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {

    //Case 1: Show the first page of options
    if (pageKey === "root") {
      const lineupPizzas = playerState.lineup.map(id => {
        const {pizzaId} = playerState.pizzas[id];
        const base = Pizzas[pizzaId];
        return {
          label: base.name,
          description: base.description,
          handler: () => {
            this.keyboardMenu.setOptions( this.getOptions(id) )
          }
        }
      })
      return [
        ...lineupPizzas,
        {
          label: "Salvar",
          description: "Salve seu progresso",
          handler: () => {
            this.progress.save();
            this.close();
          }
        },
        {
          label: "Fechar",
          description: "Feche o menu de pausa",
          handler: () => {
            this.close();
          }
        }
      ]
    }

    //Case 2: Show the options for just one pizza (by id)
    const unequipped = Object.keys(playerState.pizzas).filter(id => {
      return playerState.lineup.indexOf(id) === -1;
    }).map(id => {
      const {pizzaId} = playerState.pizzas[id];
      const base = Pizzas[pizzaId];
      return {
        label: `Swap for ${base.name}`,
        description: base.description,
        handler: () => {
          playerState.swapLineup(pageKey, id);
          this.keyboardMenu.setOptions( this.getOptions("root") );
        }
      }
    })

    return [
      ...unequipped,
      {
        label: "Mover para frente",
        description: "Mova este objeto para a frente da lista",
        handler: () => {
          playerState.moveToFront(pageKey);
          this.keyboardMenu.setOptions( this.getOptions("root") );
        }
      },
      {
        label: "Voltar",
        description: "Voltar para o meu de root",
        handler: () => {
          this.keyboardMenu.setOptions( this.getOptions("root") );
        }
      }
    ];
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <h2>Pause Menu</h2>
    `)
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    })
  }

}