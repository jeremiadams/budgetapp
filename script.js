var budgetControl = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        budgetData.dataItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        budgetData.totals[type] = sum;
    };
    
    var budgetData = {
        dataItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },  
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            
            //(NOTE)  Creates a new ID
            if (budgetData.dataItems[type].length > 0) {
                ID = budgetData.dataItems[type][budgetData.dataItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            //it uses 'inc' or 'exp' to create a new item
            if (type === 'exp') {
                newItem = new Expense (ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income (ID, des, val);
            }
            
            //return a new element
            budgetData.dataItems[type].push(newItem);
            return newItem;
            
        },
        
        deleteItem: function(type, id) {
            
            var ids = budgetData.dataItems[type].map(function(current) {
                return current.id;
            });
            
            var index = ids.indexOf(id);
            
            if (index !== -1) {
                budgetData.dataItems[type].splice(index, 1);
                
            }
    },
        
        calaulateBudget: function() {
            
            calculateTotal('exp');
            calculateTotal('inc');
            
            budgetData.budget = budgetData.totals.inc - budgetData.totals.exp;
            
            if (budgetData.totals.inc > 0) {
                budgetData.percentage = Math.round((budgetData.totals.exp / budgetData.totals.inc) * 100);
            } else {
                budgetData.percentage = -1;
            }
            
        },
        
        getBudget: function() {
            return {
                budget: budgetData.budget,
                totalInc: budgetData.totals.inc,
                totalExp: budgetData.totals.exp,
                percentage: budgetData.percentage
            };
        },
        
        testing: function() {
            console.log(budgetData);
        }
    }
    
})();

var userControl = (function() {
     var formatNumber = function(num, type) {
            num = Math.abs(num);
            num = num.toFixed(2);
            
            var numSplit = num.split('.');
         
            var int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            var dec = numSplit[1];
            
            
            return (type === 'exp' ? '-' :  '+') + ' ' + int + '.' + dec;
        };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector('.add__type').value, 
                description: document.querySelector('.add__description').value,
                value: parseFloat(document.querySelector('.add__value').value)
            }; 
        },
        
        addListItem: function(obj, type) {
           var html, newHtml, element;    
            
            //to set a place holder for the income and expense then later on change it
           if (type === 'inc') {
               element = '.income__list';
               
               html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           } else if (type === 'exp') {
               element = '.expenses__list';
               
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
           
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var e = document.getElementById(selectorID);
            e.parentNode.removeChild(e);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll('.add__description ', + '.add__value');
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exc';
            
            document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
            document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) {
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = '--';
            }
        },
        
        
        
        
    };
})();

var dataControl = (function(budgetCtrl, UICtrl) {
    
    var updateBudget = function(){
        
        budgetCtrl.calaulateBudget();
        
        var budget = budgetCtrl.getBudget();
        
        UICtrl.displayBudget(budget);
    };
    
    var setupEventListeners = function() {
        document.querySelector('.add__btn').addEventListener('click', function() {    
            
        var input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            UICtrl.addListItem(newItem, input.type);
        
            UICtrl.clearFields();   
            
            updateBudget();
        
        }   
        
    });
        document.querySelector('.container').addEventListener('click', function(event) {
             
            var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            
            if (itemID) {
                
                var splitID = itemID.split('-');
                var type = splitID[0];
                var ID = parseInt(splitID[1]);
                
                
                budgetCtrl.deleteItem(type, ID);
                
                UICtrl.deleteListItem(itemID);
                
                updateBudget();
            }
    });
        
        
    };
    
    return {
        init: function(){
            console.log('app has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

    
})(budgetControl, userControl);


dataControl.init();


























