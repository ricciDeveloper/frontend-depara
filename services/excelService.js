// Certifique-se de incluir o XLSX via CDN no index.html:
// <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

class ExcelService {
  /**
   * Parse Excel data from base64 string
   * @param {string} fileData - Base64 encoded Excel file
   * @returns {Object} Parsed DE and RASTREIO rows
   */
  parseExcelData(fileData) {
    try {
      const binary = atob(fileData);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      const workbook = window.XLSX.read(bytes, { type: 'array' });

      if (!workbook.Sheets['DE'] || !workbook.Sheets['RASTREIO']) {
        throw new Error('Planilha deve conter abas "DE" e "RASTREIO"');
      }

      const deRows = window.XLSX.utils.sheet_to_json(workbook.Sheets['DE']);
      const rastRows = window.XLSX.utils.sheet_to_json(workbook.Sheets['RASTREIO']);

      return { deRows, rastRows };
    } catch (error) {
      throw new Error(`Erro ao processar planilha: ${error.message}`);
    }
  }

  /**
   * Normalize row data to ensure consistent structure
   * @param {Array} rows - Array of row objects
   * @returns {Array} Normalized rows
   */
  normalizeRows(rows) {
    return rows.map((row, index) => {
      const url = row.url || '';
      const slug = row.slug || this.extractSlugFromUrl(url);
      
      return {
        id: row.id || `row_${index}`,
        url: url,
        slug: slug,
        meta_title: row.meta_title || row.title || '',
        meta_description: row.meta_description || row.description || row.meta || '',
        h1: row.h1 || '',
        originalIndex: index
      };
    });
  }

  /**
   * Extract slug from URL
   * @param {string} url - URL string
   * @returns {string} Extracted slug
   */
  extractSlugFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/(^\/|\/$)/g, '');
    } catch (e) {
      // Fallback: get last path segment
      const parts = String(url).split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : url;
    }
  }

  /**
   * Generate output Excel file with DE x PARA mapping (simplified format)
   * @param {Array} results - Processed results
   * @param {number} minScore - Minimum score threshold
   * @returns {Buffer} Excel file buffer
   */
  generateOutputExcel(results, minScore = 0.8) {
    try {
      // Prepare data for output - simplified format
      const outputData = [];
      
      results.forEach((result, index) => {
        const de = result.de;
        
        // Get best match (highest score) - if no match above threshold, get the best available
        let bestMatch = result.candidates
          .filter(c => (c.finalScore || c.score) >= minScore)
          .sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score))[0];

        // If no match above threshold, get the best available match
        if (!bestMatch && result.candidates.length > 0) {
          bestMatch = result.candidates
            .sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score))[0];
        }

        // Calculate final score
        const finalScore = bestMatch ? (bestMatch.finalScore || bestMatch.score) : 0;
        const scorePercentage = (finalScore * 100).toFixed(1);

        // Always include every DE URL with a PARA match (even if below threshold)
        outputData.push({
          'DE': de.url,
          'PARA': bestMatch ? bestMatch.url : 'SEM_MATCH_DISPONIVEL',
          'SCORE_GERAL': scorePercentage + '%'
        });
      });

      // Create workbook
      const workbook = window.XLSX.utils.book_new();
      
      // Create main sheet
      const worksheet = window.XLSX.utils.json_to_sheet(outputData);
      
      // Set column widths for simplified format
      const columnWidths = [
        { wch: 50 },  // DE
        { wch: 50 },  // PARA
        { wch: 15 }   // SCORE_GERAL
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      window.XLSX.utils.book_append_sheet(workbook, worksheet, 'DE_x_PARA_Resultado');

      // Create summary sheet
      const summaryData = this.createSummarySheet(results, minScore);
      const summaryWorksheet = window.XLSX.utils.json_to_sheet(summaryData);
      summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
      window.XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');

      // Generate buffer
      const buffer = window.XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      
      return buffer;

    } catch (error) {
      throw new Error(`Erro ao gerar planilha de saída: ${error.message}`);
    }
  }

  /**
   * Create summary sheet data
   * @param {Array} results - Processed results
   * @param {number} minScore - Minimum score threshold
   * @returns {Array} Summary data
   */
  createSummarySheet(results, minScore) {
    const total = results.length;
    
    // Count matches above threshold
    const aboveThreshold = results.filter(r => {
      const bestMatch = r.candidates
        .filter(c => (c.finalScore || c.score) >= minScore)
        .sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score))[0];
      return bestMatch !== undefined;
    }).length;
    
    // Count all matches (including below threshold)
    const allMatches = results.filter(r => r.candidates.length > 0).length;
    
    // Calculate average score
    const allScores = results.map(r => {
      const bestMatch = r.candidates
        .sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score))[0];
      return bestMatch ? (bestMatch.finalScore || bestMatch.score) : 0;
    });
    const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

    return [
      { 'Métrica': 'Total de URLs DE', 'Valor': total },
      { 'Métrica': 'Matches com score ≥ 80%', 'Valor': aboveThreshold },
      { 'Métrica': 'Matches encontrados (total)', 'Valor': allMatches },
      { 'Métrica': 'Taxa de match ≥ 80%', 'Valor': ((aboveThreshold / total) * 100).toFixed(1) + '%' },
      { 'Métrica': 'Taxa de match total', 'Valor': ((allMatches / total) * 100).toFixed(1) + '%' },
      { 'Métrica': 'Score médio geral', 'Valor': (avgScore * 100).toFixed(1) + '%' },
      { 'Métrica': 'Score mínimo configurado', 'Valor': (minScore * 100) + '%' },
      { 'Métrica': 'Data de processamento', 'Valor': new Date().toLocaleString('pt-BR') },
      { 'Métrica': 'Versão do sistema', 'Valor': '1.0.0' }
    ];
  }

  /**
   * Validate Excel file structure
   * @param {string} fileData - Base64 encoded Excel file
   * @returns {Object} Validation result
   */
  validateExcelFile(fileData) {
    try {
      const binary = atob(fileData);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      const workbook = window.XLSX.read(bytes, { type: 'array' });

      const hasDESheet = !!workbook.Sheets['DE'];
      const hasRastreioSheet = !!workbook.Sheets['RASTREIO'];

      if (!hasDESheet || !hasRastreioSheet) {
        return {
          valid: false,
          message: 'Planilha deve conter abas "DE" e "RASTREIO"'
        };
      }

      const deRows = window.XLSX.utils.sheet_to_json(workbook.Sheets['DE']);
      const rastRows = window.XLSX.utils.sheet_to_json(workbook.Sheets['RASTREIO']);

      if (deRows.length === 0 || rastRows.length === 0) {
        return {
          valid: false,
          message: 'Abas DE e RASTREIO não podem estar vazias'
        };
      }

      return {
        valid: true,
        message: 'Arquivo válido',
        deCount: deRows.length,
        rastreioCount: rastRows.length
      };
    } catch (error) {
      return {
        valid: false,
        message: `Erro ao validar arquivo: ${error.message}`
      };
    }
  }

  async enhanceData(deRow, candidates) {
    try {
      const resp = await fetch('/api/gemini/enhance', { // em vez de /api/gemini
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({deRow, candidates})
      });
      
      if (!resp.ok) {
        throw new Error(`Erro na comunicação com o servidor: ${resp.statusText}`);
      }
      
      const data = await resp.json();
      
      if (!data || !data.results) {
        throw new Error('Resposta inválida do servidor');
      }
      
      return data.results;
      
    } catch (error) {
      throw new Error(`Erro ao aprimorar dados: ${error.message}`);
    }
  }
}

// Exponha no window para uso global
window.ExcelService = new ExcelService();
