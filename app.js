// Budget Controller
var budgetController =(function(){
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }      
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //This method is used to calculate the total inc and total expenses
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    };
    
    //To have a cleaner code i made an object for all my data
    var data = {
        //Instead of creating an array for all exp and for all inc we will make an objec
        allItems:{
            exp: [],
            inc:[]
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1, //-1 means it doesn't exist at the moment
    };
    //to retun public methods
    return{
        addItem: function(type, des, val){
            var newItem, ID;
             
            //Create new ID
            //ID = Last ID +1
            //We first select eithe the exp or the inc array then we select the position of the last id in this array by getting the length-1
             // Create new ID
             if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new item based on 'inc' or 'exp' type
            if (type ==='exp') {
                newItem = new Expense(ID, des, val);
            } else if (type ==='inc'){
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            //here type ===exp or inc so if it is exp we will push in the exp [] and same for inc
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            //Difference between map and forach is that map returns a brand new array
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            //indexOf returns the index number of the element of the array that we input here
            // If ids= [1 2 4 6 8] the indexOf 6 is 3
            index = ids.indexOf(id);

           if (index !== -1) {

               //Splice will delete the index
               data.allItems[type].splice(index,1);

           }

        },

        calculateBudget: function(){
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income -expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of the income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }

        },

        calculatePercentages: function(){

            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });

        },

        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },

        //This is a simple function to just return result
        getBudget: function(){
            // we want to return four properties at the same time so the best way is to return an object
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage 
            }
        },
       

        testing : function(){
            console.log(data);
        }
    };
     
})();



// UI Controller
var UIController = (function(){
    //If changes have been made to the html then I will have to change all the class names  in the code that why I made an object containing the class names to change them once
    var DOMstrings={
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,3);
    
        }

        dec = numSplit[1];

        
        return (type === 'exp' ? '-' : '+')+ ' ' + int + '.' + dec;

    };
    //callback is the function with param current and index
    var nodeListForEach = function(list, callback){
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
            
        }
    };

    return{
        getInput: function(){
            //I want to retun all of the 3 variables to be called in the controller that's why i made a return object
            return{
                 type : document.querySelector( DOMstrings.inputType).value,// will be either inc or exp
                 description : document.querySelector(DOMstrings.inputDescription).value,
                 value : parseFloat(document.querySelector(DOMstrings.inputValue).value) ,
            };
           
        },

        addListItem: function(obj, type){
             
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else  if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';

            };
            
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID){

            //In js we can only delete the child
            // document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));
            var el =  document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields= document.querySelectorAll(DOMstrings.inputDescription + ', '+ DOMstrings.inputValue);
            
            //querySelectorAll returns a list so we need to convert it to an array by using slice method which can be called by using the array prototype
           fieldsArr= Array.prototype.slice.call(fields);

           //current means current element, current index, and array is the original array which is fieldsArr
           fieldsArr.forEach(function(current, index, array) {
            current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0? type = 'inc' : type = 'exp';
            // The object that we are using is from the getBudget function which returns the values we need 
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type) ;
            document.querySelector(DOMstrings.incomeLabel).textContent =formatNumber(obj.totalInc,'inc') ;
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
                               
            
        },

        displayPercentages: function(percentages){
            //This returns a Node list not just a list because in a DOMtree where HTML elements of our page are stored, each one is called element
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            

            nodeListForEach(fields, function(current, index){

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function (){
            var now, months, month, year ;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType : function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },
       

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();



// Global App Controller
var controller = (function(budgetCtrl,UICtrl){

    //To make code cleaner i added all EventListeners in a function but now it became private so i have to make a return object and call it outside of controller
    var setupEventListeners = function (){
        var DOM = UIController.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
   
        //In case he pressed enter Not just the button and enter code is 13
        //which and keycode are the same but which for older browsers
         document.addEventListener('keypress',function(event){
             if (event.keyCode === 13 || event.which ===13) {
           ctrlAddItem();
             }
         });
         //To be able to delete we will use event delegation that's why we will choose the container not the delete button
         document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
         
         document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function (){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3.Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function(){
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentage();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input,newItem;

        //1. Get the filed input data
         input = UIController.getInput();
         if (input.description !=="" && !isNaN(input.value ) && input.value> 0) {
            //2.Add the item to the budget controller
             newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
             //3.Add the item to the UI
             UICtrl.addListItem(newItem, input.type);

             //4. Clear the fields
             UICtrl.clearFields();

             //5. Calculate and update budget
             updateBudget();

             //6.Calculate and update percentages
             updatePercentages();
         }
        
       
    
    };
    // we want to know what the target event is that's why we put event
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        //We used parentNode because we don't want the icon or the button but we want the parent node which has the id of income or expenses
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //inc-1 transform to inc  1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); //because split return string
            
            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

             //4.Calculate and update percentages
             updatePercentages();
        }

    };

    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            // This is to set everything to zero
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController,UIController);

controller.init();