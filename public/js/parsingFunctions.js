const axios = require("axios")
const cheerio = require('cheerio')
/**
 * Searches the body of the HTML for given search terms. Pushes the results to the data object.
 * 
 * @param {string} category The category of recipe data (instructions or ingredients)
 * @param {object} data The object in which the recipe data will be stored
 * @param {array} searchTerms The terms we will search for within the website
 * @param {obj} $ The parsed HTML data that was retruned by the fetchHTML function
 */
function getBodyData(category, data, searchTerms, $) {
    var results = []
    for (var i = 0; i < searchTerms.length; i++) {
      let term = searchTerms[i]
      let searchResults = $("body").find(term);
      if (searchResults.length !== 0) {
        searchResults.each(function (index, element) {
          results.push($(element).text());
        });
        data[category].push(results);
        return data
      }
    }
}


/**
 * Searches the application/ld+json script for ingredients and instructions.  Pushes the matching results to the data object.
 * 
 * @param {obj} result The category of recipe data (instructions or ingredients)
 * @param {obj} data The object in which the recipe data will be stored
 */
function getScriptData(result, data) {
    if (typeof result.recipeIngredient !== 'undefined' && typeof result.recipeInstructions !== 'undefined') {
      data["ingredients"].push(result.recipeIngredient)
      var obj = result.recipeInstructions
  
      // Drill down nested objects
      function findList(obj) {
        var parent = obj, notFound = true;
        while (notFound) {
            if (typeof obj !== "string") {
                parent = obj
                obj = obj[0]
            } else {
                notFound = false;
            }
        }
        return parent;
      }
      
      var instructionsList = result.recipeInstructions
      var instructions = []
      for (var i = 0; i < instructionsList.length; i++) {
        if (typeof instructionsList[i].text !== 'undefined') {
          instructions.push(instructionsList[i].text);
        }
        else {
          instructions.push(instructionsList[i]);
        }
      }
      data["instructions"].push(instructions)
      return data
    } else {
      for (var i = 0; i < result.length; i++) {
        let element = result[i]
        
        if (typeof element.recipeIngredient !== 'undefined' ) {
          data["ingredients"].push(element.recipeIngredient)
        };
  
        if (typeof element.recipeInstructions !== 'undefined' ) {
          for (var i = 0; i < element.recipeInstructions.length; i++) {
            instructions.push(element.recipeInstructions[i].text);
          }
          data["instructions"].push(instructions)
          return data
        };
      }
      return data
    }
  }


function findResults(result) {
    for (var i = 0; i < result.length; i++) {
        var newResult = result[i]
        if (typeof newResult.recipeIngredient !== 'undefined' && typeof newResult.recipeInstructions !== 'undefined') {
        return newResult
        }
    };
};

async function fetchHTML(url) {
    const { data } = await axios.get(url)
    return cheerio.load(data, {
      xml: {
        normalizeWhitespace: true,
      }
    });
  }

var ingredSearchTerms = ["span[class*='CheckboxLabel']", "span[class*='ingredient'] > p", "ul[class*='ingredient'] > li", "li[itemprop*='ingredient']", "li[itemprop*='Ingredient']", "span[class*='ingredient']", "span[class*='Ingredient']", "li[class*='ingredient']", "li[class*='Ingredient']", "div[class*='ingredient'] > ul > li" ,"div[class*='ingredient']"> "div[class*='ingredient']", "section > ul[class*='list'] > li", "div[data-tasty-recipes-customization*='body'] > ul > li"];

var instructSearchTerms = ["div[data-tasty-recipes-customization*='body'] > ol > li", "li[class*='o-Method']","ol[class*='step'] > li", "ul[class*='Step'] > li", "li[itemprop*='instruction']", "li[itemprop*='Instruction']", "span[class*='instruction']", "span[class*='Instruction']", "li[class*='instruction']", "li[class*='Instruction']", "div[class*='instruction'] > ol > li", "div[class*='Instruction']", "div[class*='preparation']", "div[class*='Preparation']", "div[class*='method']", "div[class*='Method']", "span[class*='direction'] > p", "ul[class*='direction']", "div[class*='direction'] > ol > li","li > p", "div[class*='instruction']", "div > ul > li > p"];


module.exports = {getBodyData, getScriptData, findResults, fetchHTML, ingredSearchTerms, instructSearchTerms}