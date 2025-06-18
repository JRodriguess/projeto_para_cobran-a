
    // Funções para formatação de moeda
    function formatarBRL(valor) {
      const numero = parseFloat(valor.replace(/[^\d]/g, '')) / 100;
      if (isNaN(numero)) return '';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
    }
    
    function removerFormatacaoMoeda(valor) {
      return parseFloat(valor.replace(/[^\d]/g, '')) / 100;
    }

    function aplicarMascaraMoeda(input) {
      input.addEventListener('input', () => {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length < 3) valor = valor.padStart(3, '0');
        input.value = formatarBRL(valor);
      });
    }

    // Aplicar máscara de moeda aos campos
    aplicarMascaraMoeda(document.getElementById('valorTotal'));
    aplicarMascaraMoeda(document.getElementById('valorAdiantamento'));

    // Elementos DOM
    const radioButtons = document.querySelectorAll('input[name="pagamento"]');
    const parceladoOptions = document.getElementById('parcelado-options');
    const parcelasInput = document.getElementById('parcelas');
    const dataInicialInput = document.getElementById('dataInicial');
    const parcelasGeradas = document.getElementById('parcelasGeradas');
    const adiantamentoGroup = document.getElementById('adiantamentoGroup');
    const mensagemFinal = document.getElementById('mensagemFinal');
    const whatsappButton = document.getElementById('whatsappButton');

    // Definir data mínima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    dataInicialInput.min = hoje;

    // Gerenciar visibilidade das opções de parcelamento
    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'parcelado') {
          parceladoOptions.style.display = 'flex';
          adiantamentoGroup.style.display = 'none';
          mensagemFinal.style.display = 'none';
          whatsappButton.style.display = 'none';
        } else {
          parceladoOptions.style.display = 'none';
          adiantamentoGroup.style.display = 'block';
          parcelasGeradas.innerHTML = '';
          mensagemFinal.style.display = 'none';
          whatsappButton.style.display = 'none';
        }
      });
    });

    // Gerar parcelas quando os inputs forem alterados
    function gerarParcelas() {
      const qtd = parseInt(parcelasInput.value);
      const dataInicial = new Date(dataInicialInput.value);
      const valorTotal = removerFormatacaoMoeda(document.getElementById('valorTotal').value);

      if (!isNaN(qtd) && dataInicial.toString() !== 'Invalid Date' && valorTotal > 0) {
        let html = '<strong><i class="fas fa-edit"></i> Editar valores das parcelas:</strong><ul>';
        const valorParcela = (valorTotal / qtd).toFixed(2);

        for (let i = 0; i < qtd; i++) {
          const vencimento = new Date(dataInicial);
          vencimento.setMonth(vencimento.getMonth() + i);
          html += `<li>${vencimento.toLocaleDateString('pt-BR')}: <input type="text" id="parcela${i}" value="${formatarBRL((valorParcela * 100).toString())}"></li>`;
        }
        html += '</ul>';
        parcelasGeradas.innerHTML = html;

        // Aplicar máscara aos novos campos
        setTimeout(() => {
          for (let i = 0; i < qtd; i++) {
            aplicarMascaraMoeda(document.getElementById(`parcela${i}`));
          }
        }, 50);
      } else {
        parcelasGeradas.innerHTML = '';
      }
    }

    parcelasInput.addEventListener('input', gerarParcelas);
    dataInicialInput.addEventListener('change', gerarParcelas);

    // Gerar mensagem final
    function gerarMensagem() {
      const valorTotal = removerFormatacaoMoeda(document.getElementById('valorTotal').value);
      const valorAdiantamento = removerFormatacaoMoeda(document.getElementById('valorAdiantamento').value);
      const material = document.getElementById('material').value;
      const telefone = document.getElementById('whatsapp').value.replace(/\D/g, '');
      const pagamentoAvista = document.querySelector('input[name="pagamento"]:checked').value === 'avista';

      // Validações
      if (isNaN(valorTotal) || valorTotal <= 0) {
        alert("Por favor, preencha o valor total corretamente.");
        return;
      }
      
      if (telefone.length < 10) {
        alert("Por favor, preencha o WhatsApp corretamente.");
        return;
      }

      let mensagem = "";
      let whatsappLink = "";

      if (pagamentoAvista) {
        if (isNaN(valorAdiantamento) || valorAdiantamento < 0) {
          alert("Por favor, preencha o valor do adiantamento corretamente.");
          return;
        }
        
        const restante = valorTotal - valorAdiantamento;
        mensagem = `Bom dia, a ${material} está pronta, o total ${formatarBRL((valorTotal * 100).toString())} foi feito um adiantamento de ${formatarBRL((valorAdiantamento * 100).toString())} e ficou restando ${formatarBRL((restante * 100).toString())}`;
      } else {
        const qtd = parseInt(parcelasInput.value);
        
        if (isNaN(qtd) || qtd <= 0) {
          alert("Por favor, preencha a quantidade de parcelas corretamente.");
          return;
        }
        
        // Verificar se a primeira parcela existe
        const primeiraParcela = document.getElementById('parcela0');
        if (!primeiraParcela) {
          alert("Por favor, gere as parcelas primeiro.");
          return;
        }
        
        const valorPrimeiraParcela = removerFormatacaoMoeda(primeiraParcela.value);
        const dataPrimeiraParcela = new Date(dataInicialInput.value).toLocaleDateString('pt-BR');
        
        mensagem = `Bom dia sua mercadoria ficou pronta, o total ficou ${formatarBRL((valorTotal * 100).toString())}, parcelado em ${qtd}x de ${formatarBRL((valorPrimeiraParcela * 100).toString())}, primeira parcela em ${dataPrimeiraParcela}`;
      }

      // Exibir mensagem final na página
      mensagemFinal.textContent = mensagem;
      mensagemFinal.style.display = 'block';
      
      // Criar link para WhatsApp Web
      whatsappLink = `https://web.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`;
      whatsappButton.href = whatsappLink;
      whatsappButton.style.display = 'flex';
    }

    // Inicialização
    document.addEventListener('DOMContentLoaded', function() {
      // Configurar data inicial como hoje
      const hoje = new Date().toISOString().split('T')[0];
      document.getElementById('dataInicial').value = hoje;
      
      // Aplicar máscara de telefone
      const whatsappInput = document.getElementById('whatsapp');
      whatsappInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length > 0) {
          value = value.replace(/^(\d{0,2})(\d{0,5})(\d{0,4})/, '($1) $2-$3');
        }
        this.value = value;
      });
    });
