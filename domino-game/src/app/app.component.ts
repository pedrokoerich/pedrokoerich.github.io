import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDragStart, transferArrayItem } from '@angular/cdk/drag-drop';

interface DominoPiece {
  piece: [number, number]; // Peça de dominó
  rotation: number; // Propriedade para controlar a rotação das peças
  margin: number; 
  orientation: string; // Propriedade para controlar a orientação das peças (left ou right)
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public player1: DominoPiece[] = []; // Peças do jogador 1
  public player2: DominoPiece[] = []; // Peças do jogador 2
  public playAreaData: [number, number][] = []; // Peças disponíveis para compra
  public done: DominoPiece[] = [];   // Peças na mesa
  public draggedPieceIndex: number | null = null; // Índice da peça arrastada
  public message: string = ''; // Mensagem exibida no modal
  public lFim: boolean = false; // Verifica se o jogo acabou
  public player1Score: number = 0; // Pontuação do jogador 1
  public player2Score: number = 0; // Pontuação do jogador 2

  // Função para gerar todas as peças de dominó possíveis
  generateDominoPieces(): [number, number][] {
    const pieces: [number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        pieces.push([i, j]);
      }
    }
    return pieces;
  }
  
  ngOnInit() {
    const allPieces = this.generateDominoPieces();
    const numPiecesPerPlayer = 7;
    const { player1, player2, buy } = this.distributePieces(allPieces, numPiecesPerPlayer);

    this.player1 = player1;
    this.player2 = player2;
    this.playAreaData = buy;
  }

  // Função para distribuir as peças entre os jogadores
  distributePieces(allPieces: [number, number][], numPieces: number): { player1: DominoPiece[], player2: DominoPiece[], buy: [number, number][] } {
    const shuffledPieces = allPieces.sort(() => Math.random() - 0.5);
    const player1: DominoPiece[] = [];
    const player2: DominoPiece[] = [];
    const buy: [number, number][] = [];
    const player1Counts = new Map<number, number>();
    const player2Counts = new Map<number, number>();

    for (const piece of shuffledPieces) {
      const [left, right] = piece;
      // Verifica se algum jogador já possui mais de 5 peças com o mesmo número
      if ((player1Counts.get(left) ?? 0) >= 5 || (player1Counts.get(right) ?? 0) >= 5) {
          buy.push(piece);
      } else if ((player2Counts.get(left) ?? 0) >= 5 || (player2Counts.get(right) ?? 0) >= 5) {
          buy.push(piece);
      } else {
        // Distribui a peça para o jogador 1 se ele ainda não atingiu o limite
        if (player1.length < numPieces) {
          player1.push({ piece,  rotation: 0, margin: 8, orientation: ''});
          player1Counts.set(left, (player1Counts.get(left) ?? 0) + 1);
          player1Counts.set(right, (player1Counts.get(right) ?? 0) + 1);
        } 
        // Distribui a peça para o jogador 2 se ele ainda não atingiu o limite
        else if (player2.length < numPieces) {
          player2.push({ piece,  rotation: 0, margin: 8, orientation: ''});
          player2Counts.set(left, (player2Counts.get(left) ?? 0) + 1);
          player2Counts.set(right, (player2Counts.get(right) ?? 0) + 1);
        } 
        // Adiciona a peça à pilha de compra caso ambos os jogadores já tenham atingido o limite
        else {
          buy.push(piece);
        }
      }
    }
    return { player1, player2, buy };
  }

  drop(event: CdkDragDrop<DominoPiece[]>) {
    const targetIndex = event.currentIndex;
    const droppedItem = event.previousContainer.data[event.previousIndex];
    const targetPiece = this.done.length > 0 ? this.done[0] : null; // Peça adjacente à direita
    const pieceFreeLeft = this.done && this.done.length > 0 ? { piece: this.done[0].piece, orientation: this.done[0].orientation } : null;
    const pieceFreeRight = this.done && this.done.length > 0 ? { piece: this.done[this.done.length-1].piece, orientation:this.done[this.done.length-1].orientation } : null;
    const droppedLeftSide = droppedItem.piece[0];
    const droppedRightSide = droppedItem.piece[1];

    //se a mesa possuir peças
    if (targetPiece) {
      //AQUI SÃO VALIDAÇÃO DA EXTREMIDADE ESQUERDA
      //se o lado de cima da peça jogada for igual ao lado de cima da peça que está na extremidade esquerda da mesa
      if ((pieceFreeLeft && pieceFreeRight) && (droppedLeftSide === pieceFreeLeft.piece[0]) && (pieceFreeLeft.orientation === 'left' || pieceFreeLeft.orientation === '')) {
        //se a peça da extremidade estiver rotacionada pra esquerda
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        }else {
          droppedItem.rotation = 90;
          droppedItem.orientation = 'right';
          droppedItem.margin = 15;
        }
        let index = 0;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      }else if ((pieceFreeLeft && pieceFreeRight) && (droppedRightSide === pieceFreeLeft.piece[0]) && (pieceFreeLeft.orientation === 'left' || pieceFreeLeft.orientation === '')) {
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        }else {
          droppedItem.rotation = -90;
          droppedItem.orientation = 'left';
          droppedItem.margin = 15;
        }
        let index = 0;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      }else if  ((pieceFreeLeft && pieceFreeRight) && (droppedLeftSide === pieceFreeLeft.piece[1]) && (pieceFreeLeft.orientation === 'right' || pieceFreeLeft.orientation === '')) {
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        }else {
          droppedItem.rotation = 90;
          droppedItem.orientation = 'right';
          droppedItem.margin = 15;
        }
        let index = 0;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      }else if  ((pieceFreeLeft && pieceFreeRight) && (droppedRightSide === pieceFreeLeft.piece[1]) && (pieceFreeLeft.orientation === 'right' || pieceFreeLeft.orientation === '')) {
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        } else {
          droppedItem.rotation = -90;
          droppedItem.orientation = 'left';
          droppedItem.margin = 15;
        }
        let index = 0;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      //AQUI SÃO VALIDAÇÃO DA EXTREMIDADE DIREITA
      }else if ((pieceFreeLeft && pieceFreeRight) && (droppedLeftSide === pieceFreeRight.piece[0]) && (pieceFreeRight.orientation === 'right' || pieceFreeRight.orientation === '')) {
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        }else {
          droppedItem.rotation = -90;
          droppedItem.orientation = 'left';
          droppedItem.margin = 15;
        }
        let index = this.done.length;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      }else if ((pieceFreeLeft && pieceFreeRight) && (droppedRightSide === pieceFreeRight.piece[0]) && (pieceFreeRight.orientation === 'right' || pieceFreeRight.orientation === '')) {
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        }else {
          droppedItem.rotation = 90;
          droppedItem.orientation = 'right';
          droppedItem.margin = 15;
        }
        let index = this.done.length;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      }else if ((pieceFreeLeft && pieceFreeRight) && (droppedLeftSide === pieceFreeRight.piece[1]) && (pieceFreeRight.orientation === 'left' || pieceFreeRight.orientation === '')) {
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        }else {
          droppedItem.rotation = -90;
          droppedItem.orientation = 'left';
          droppedItem.margin = 15;
        }
        let index = this.done.length;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      }else if ((pieceFreeLeft && pieceFreeRight) && (droppedRightSide === pieceFreeRight.piece[1]) &&  (pieceFreeRight.orientation === 'left' || pieceFreeRight.orientation === '')) {
        if (droppedLeftSide === droppedRightSide) {
          droppedItem.rotation = 0;
          droppedItem.orientation = '';
          droppedItem.margin = 4;
        }else {
          droppedItem.rotation = 90;
          droppedItem.orientation = 'right';
          droppedItem.margin = 15;
        }
        let index = this.done.length;
        transferArrayItem(
          event.previousContainer.data, //mão do jogador
          event.container.data, //mesa
          event.previousIndex, //indice origem 
          index //indice destino 
        );
      }else {
        this.message = "Não é possível jogar esta peça nesta posição."
        this.openModal();
      }

    } else if (this.done.length === 0) { // Verifica se a mesa está vazia
      // Deixa a peça deitada se tiver lados diferentes
      if (droppedItem.piece[0] !== droppedItem.piece[1]) {
        droppedItem.rotation = -90; //Left
        droppedItem.orientation = 'left';
        droppedItem.margin = 15;
      }else {
        droppedItem.rotation = 0;
        droppedItem.orientation = '';
        droppedItem.margin = 4;
      }
  
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        targetIndex
      );
    }

    //CHAMA A FUNÇÃO DO BOT
    this.validaGanhador();
    if (!this.lFim) {
      this.botPlay();
    }
  }
  
  comprarPeca() {
    // Verifica se o jogador já possui alguma peça que pode ser jogada
    const isFirstMove = this.done.length === 0;
    const pieceFreeLeft = this.done && this.done.length > 0 ? { piece: this.done[0].piece, orientation: this.done[0].orientation } : null;
    const pieceFreeRight = this.done && this.done.length > 0 ? { piece: this.done[this.done.length-1].piece, orientation:this.done[this.done.length-1].orientation } : null;
    let valorDisponivelLeft = 0;
    let valorDisponivelRight = 0;

    if (isFirstMove) {
      this.message = 'Você não pode comprar uma peça na primeira jogada. Jogue uma peça da sua mão primeiro.'
      this.openModal();
      return; // Sai da função sem comprar uma peça
    }

    if (this.playAreaData.length === 0) {
      this.message = 'Não há peças disponíveis para compra.';
      this.openModal();
      return; // Sai da função sem comprar uma peça
    }

    // Verifica o valor disponível na extremidade esquerda da mesa
    if (pieceFreeLeft && (pieceFreeLeft.orientation === 'left' || pieceFreeLeft.orientation === '')) {
      valorDisponivelLeft = pieceFreeLeft.piece[0];
    } else if (pieceFreeLeft && (pieceFreeLeft.orientation === 'right' || pieceFreeLeft.orientation === '')) {
      valorDisponivelLeft = pieceFreeLeft.piece[1];
    }

    // Verifica o valor disponível na extremidade direita da mesa 
    if (pieceFreeRight && (pieceFreeRight.orientation === 'left' || pieceFreeRight.orientation === '')) {
      valorDisponivelRight = pieceFreeRight.piece[1];
    } else if (pieceFreeRight && (pieceFreeRight.orientation === 'right' || pieceFreeRight.orientation === '')) {
      valorDisponivelRight = pieceFreeRight.piece[0];
    }

    // Verifica se existem peças possíveis para jogar
    const hasPossiblePieces = this.player2.some(piece => {
      const [left, right] = piece.piece;
      return left === valorDisponivelLeft || left === valorDisponivelRight || right === valorDisponivelLeft || right === valorDisponivelRight;
    });

    if (hasPossiblePieces) {
      this.message = 'Não é possível comprar uma peça. Existem peças possíveis para jogar.';
      this.openModal();
    } else {
      // Compra a peça
      const newPiece = this.playAreaData.pop();
      if (newPiece) {
        this.player2.push({ piece: newPiece, rotation: 0, margin: 8, orientation: '' });
        this.validaGanhador();
      }
    }
  }

  closeModal() {
    let modal = document.getElementById("modal");
    if (modal) {
      modal.style.display = "none"; // Oculta o modal
    }
  }

  openModal() {
    let modal = document.getElementById("modal");
    let btn = document.getElementsByClassName("play-again-button")[0] as HTMLElement; // Access the specific element in the HTMLCollection
    if (this.lFim) {
      btn.style.display = "block"; // Set the style property of the element
    }
    if (modal) {
      modal.style.display = "block"; // Mostra o Modal
    }
  }

  dragStarted(event: CdkDragStart) {
    const draggedPieceId = event.source.element.nativeElement.id;
    this.draggedPieceIndex = parseInt(draggedPieceId.split('_')[1]);
  }

  playAgain() {
    // Redefina o estado do jogo para começar uma nova partida
    this.player1 = []; // Limpe as peças do jogador 1
    this.player2 = []; // Limpe as peças do jogador 2
    this.done = []; // Limpe as peças na mesa
    this.playAreaData = this.generateDominoPieces(); // Recarregue as peças disponíveis para compra
  
    // Distribua as peças novamente
    const numPiecesPerPlayer = 7;
    const { player1, player2, buy } = this.distributePieces(this.playAreaData, numPiecesPerPlayer);
    this.player1 = player1;
    this.player2 = player2;
    this.playAreaData = buy; // Atualize as peças disponíveis para compra
  
    // Feche o modal após reiniciar o jogo
    this.closeModal();
    let btn = document.getElementsByClassName("play-again-button")[0] as HTMLElement; // Access the specific element in the HTMLCollection
    btn.style.display = "none"; 
    this.lFim = false;
  }
  
  botPlay() {
    // Verificar as peças nas extremidades
    const pieceFreeLeft = this.done.length > 0 ? this.done[0] : null; // Peça adjacente à esquerda
    const pieceFreeRight = this.done.length > 0 ? this.done[this.done.length - 1] : null; // Peça adjacente à direita
    let valorDisponivelLeft = 0;
    let valorDisponivelRight = 0;

    if (pieceFreeLeft && (pieceFreeLeft.orientation === 'left' || pieceFreeLeft.orientation === '')) {
      valorDisponivelLeft = pieceFreeLeft.piece[0];
    } else if (pieceFreeLeft && (pieceFreeLeft.orientation === 'right' || pieceFreeLeft.orientation === '')) {
      valorDisponivelLeft = pieceFreeLeft.piece[1];
    }

    if (pieceFreeRight && (pieceFreeRight.orientation === 'left' || pieceFreeRight.orientation === '')) {
      valorDisponivelRight = pieceFreeRight.piece[1];
    } else if (pieceFreeRight && (pieceFreeRight.orientation === 'right' || pieceFreeRight.orientation === '')) {
      valorDisponivelRight = pieceFreeRight.piece[0];
    }

    // Verificar as peças na mão do jogador
    let playablePiece: DominoPiece | null = null;
    let index = 0;
    for (const piece of this.player1) {
      const [left, right] = piece.piece;
      if (valorDisponivelLeft === left ) {
        playablePiece = piece;
        if (playablePiece.piece[0] === playablePiece.piece[1]) {
          playablePiece.rotation = 0;
          playablePiece.orientation = '';
          playablePiece.margin = 4;
        }else {
          playablePiece.rotation = 90;
          playablePiece.orientation = 'right';
          playablePiece.margin = 15;
        }
        index = 0;
        break; // Encontrou uma peça jogável, então pare de procurar
      }else if (valorDisponivelLeft === right ) {
        playablePiece = piece;
        if (playablePiece.piece[0] === playablePiece.piece[1]) {
          playablePiece.rotation = 0;
          playablePiece.orientation = '';
          playablePiece.margin = 4;
        }else {
          playablePiece.rotation = -90;
          playablePiece.orientation = 'left';
          playablePiece.margin = 15;
        }
        index = 0;
        break; // Encontrou uma peça jogável, então pare de procurar
      }else if (valorDisponivelRight === left) {
        playablePiece = piece;
        if (playablePiece.piece[0] === playablePiece.piece[1]) {
          playablePiece.rotation = 0;
          playablePiece.orientation = '';
          playablePiece.margin = 4;
        }else {
          playablePiece.rotation = -90;
          playablePiece.orientation = 'left';
          playablePiece.margin = 15;
        }
        index = this.done.length;
        break; // Encontrou uma peça jogável, então pare de procurar
      }else if (valorDisponivelRight === right) {
        playablePiece = piece;
        if (playablePiece.piece[0] === playablePiece.piece[1]) {
          playablePiece.rotation = 0;
          playablePiece.orientation = '';
          playablePiece.margin = 4;
        }else {
          playablePiece.rotation = 90;
          playablePiece.orientation = 'right';
          playablePiece.margin = 15;
        }
        index = this.done.length;
        break; // Encontrou uma peça jogável, então pare de procurar
      }
    }
  
    // Efetuar a jogada se uma peça jogável foi encontrada
    if (playablePiece) {
      // Realize a transferência da peça
      transferArrayItem(
        this.player1, // Array de origem (mão do jogador)
        this.done, // Array de destino (mesa de jogo)
        this.player1.indexOf(playablePiece), // Índice da peça jogável na mão do jogador
        index // Índice de destino na mesa de jogo
      );
      this.validaGanhador();
    } else {
      // Se nenhuma peça jogável foi encontrada, imprima uma mensagem ou execute outras ações, se necessário
      const newPiece = this.playAreaData.pop();
      if (newPiece) {
        this.player1.push({ piece: newPiece, rotation: 0, margin: 8, orientation: '' });
        this.botPlay(); // Tente jogar novamente
      }
    }
  }

  validaGanhador() {
    if (this.player2.length === 0) {
      this.message = 'Parabéns! Você venceu o jogo!';
      this.player2Score++;
      this.lFim = true;
      this.openModal();
    } else if (this.player1.length === 0) {
      this.message = 'O computador venceu o jogo! Tente novamente.';
      this.player1Score++;
      this.lFim = true;
      this.openModal();
    } else if (this.playAreaData.length === 0 && this.player2.length !== 0 && this.player1.length !== 0) {
      // Verificar se o jogo empatou
      const pieceFreeLeft = this.done && this.done.length > 0 ? { piece: this.done[0].piece, orientation: this.done[0].orientation } : null;
      const pieceFreeRight = this.done && this.done.length > 0 ? { piece: this.done[this.done.length-1].piece, orientation:this.done[this.done.length-1].orientation } : null;
      let valorDisponivelLeft = 0;
      let valorDisponivelRight = 0;

      if (pieceFreeLeft && pieceFreeLeft.orientation === 'left') {
        valorDisponivelLeft = pieceFreeLeft.piece[0];
      } else if (pieceFreeLeft && pieceFreeLeft.orientation === 'right') {
        valorDisponivelLeft = pieceFreeLeft.piece[1];
      }

      if (pieceFreeRight && pieceFreeRight.orientation === 'left') {
        valorDisponivelRight = pieceFreeRight.piece[1];
      } else if (pieceFreeRight && pieceFreeRight.orientation === 'right') {
        valorDisponivelRight = pieceFreeRight.piece[0];
      }

      // Verificar se nenhum dos jogadores tem peças que encaixam com as peças disponíveis na esquerda e na direita
      const noPossiblePlayer1 = !this.player1.some(piece => {
        const [left, right] = piece.piece;
        return left === valorDisponivelLeft || left === valorDisponivelRight || right === valorDisponivelLeft || right === valorDisponivelRight;
      })  

      const noPossiblePlayer2 = !this.player2.some(piece => {
        const [left, right] = piece.piece;
        return left === valorDisponivelLeft || left === valorDisponivelRight || right === valorDisponivelLeft || right === valorDisponivelRight;
      });

      if (noPossiblePlayer1 && noPossiblePlayer2) {
        this.message = 'O jogo empatou! Tente novamente.';
        this.lFim = true;
        this.openModal();
      }else if (!noPossiblePlayer1 && noPossiblePlayer2) {
        this.botPlay();
      }else if (!noPossiblePlayer2 && noPossiblePlayer1) {
        console.log("MINHA VEZ")
      }
    }
  }
}
