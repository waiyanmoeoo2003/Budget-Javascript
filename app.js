 var budgetController=(function(){
	var Expense=function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;

	}
	Expense.prototype.calcPercentage=function(totalIncome){
		if(totalIncome > 0){
			this.percentage=Math.round((this.value/totalIncome)*100);
		}else{
			this.percentage=-1;
		}
	}
	Expense.prototype.getPercentage=function(){
		return this.percentage;
	}
	var Income=function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
	}
	var data={
		allitems :{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,
		percentage:-1
	}
	var calculateTotal=function(type){
		var sum=0;
		data.allitems[type].forEach(function(cur){
			sum+=cur.value;
			
		})
		data.totals[type]=sum;
	}
	return {
		addItem : function(type,des,val){
			var newItem,ID;
			//Create New ID
			if(data.allitems[type].length>0){
				ID=data.allitems[type][data.allitems[type].length-1].id+1;	
			}else{
				ID=0;
			}
			
			//Create New Id base on EXP or INC
			if(type==='inc'){
				newItem=new Income(ID,des,val);
			}else if(type==='exp'){
				newItem=new Expense(ID,des,val);
			}
			//Push it into our datastructure
			data.allitems[type].push(newItem);
			return newItem;
		},
		deleteItem:function(type,id){
			//id=6
			//index=3
			//[1 2 4 6 8]
			var ids=data.allitems[type].map(function(current){
				return current.id;
			})
			var index=ids.indexOf(id);
			if(index!==-1){
				data.allitems[type].splice(index,1);
			}
		},
		calculateBudget:function(){
			//1.Calculate Total income and total expanse
			calculateTotal('exp');
			calculateTotal('inc');
			//2.Calculate budget : income - expanse
			data.budget=data.totals.inc - data.totals.exp;
			//3.Calculate the percentage of income that we spent
			if(data.totals.inc>0){
				data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
			}else{
				data.percentage=-1;
			}
			

		},
		getBudget:function(){
			return {
				budget:data.budget,
				totalInc:data.totals.inc,
				totalExp:data.totals.exp,
				percentage:data.percentage
			}
		},
		calculatePercentage:function(){
			  data.allitems.exp.forEach(function(cur){
			  	cur.calcPercentage(data.totals.inc);
			  })
		},
		getPercentage:function(){
			var allPerc=data.allitems.exp.map(function(cur){
				return cur.getPercentage();
			})
			return allPerc;
		},
		test:function(){
			return data.allitems;
		}

	}
	
})();
	
//UI Controller
var UIController = (function(){
	var DOMString={
		inputType:'.add__type',
		inputDescription:'.add__description',
		inputValue:'.add__value',
		inputBtn:'.add__btn',
		incomeElement:'.income__list',
		expenseElement:'.expenses__list',
		budgetLabel:'.budget__value',
		incomeLabel:'.budget__income--value',
		expenseLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		container:'.container',
		expensePercLabel:'.item__percentage',
		dateLabel:'.budget__title--month'

	}
	var formatNumber =function(num,type){
			var numSplit,int,type,dec;
			num=Math.abs(num)
			num=num.toFixed(2);
			numSplit=num.split('.');
			int =numSplit[0];
			if(int.length>3){
				int=int.substr(0,int.length-3)+','+int.substr(int.length-3,int.length);
			}
			
			dec=numSplit[1];
			return (type==='exp' ? '-' : '+')+'' +int+'.'+dec;
		}
	return {
		getinput:function(){
			return{
				type: document.querySelector(DOMString.inputType).value,
				description:document.querySelector(DOMString.inputDescription).value,
				value:parseFloat(document.querySelector(DOMString.inputValue).value) 
			}
		},
		getDOMString:function(){
			return DOMString;
		},
		addListItem:function(obj,type){
			var html,newHTML,element;
			//Create HTML String with placeholder Test
			if(type==='inc'){
				element=DOMString.incomeElement;
				html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type==='exp'){
				element=DOMString.expenseElement;
				html='<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';	
			}
			newHTML=html.replace('%id%',obj.id);
			newHTML=newHTML.replace('%description%',obj.description);
			newHTML=newHTML.replace('%value%',formatNumber(obj.value,type));
			
			document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
		},
		deleteListItem:function(selectorID){
			var el=document.getElementById(selectorID);
			el.parentNode.removeChild(el);

		},
		clearFields : function(){
			var fields,fieldsArr,
			fields=document.querySelectorAll(DOMString.inputDescription+','+DOMString.inputValue);
			fieldsArr=Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current,index,array){
				current.value='';
			})
			fields[0].focus();
		},
		displayBudget:function(obj){
			var type;
			obj.budget >0 ?type='inc' :type='exp';
			document.querySelector(DOMString.budgetLabel).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOMString.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMString.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
			if(obj.percentage>0){
				document.querySelector(DOMString.percentageLabel).textContent=obj.percentage+'%';
			}else{
				document.querySelector(DOMString.percentageLabel).textContent='---';
			}
			
		},
		displayPercentage:function(percentage){
			var fields=document.querySelectorAll(DOMString.expensePercLabel);
			var nodeListforEach = function(list,callback){
				for(var i=0; i<list.length; i++){
					callback(list[i],i);
				}
			}
			nodeListforEach(fields,function(current,index){
				if(percentage[index]>0){
					current.textContent=percentage[index]+'%';
				}else{
					current.textContent='---';
				}
			})
				
			
		},
		displayMonth:function(){
			var now,year,month;
			now=new Date();
			year=now.getFullYear();
			month=now.getMonth();
			months=["January","February","March","April","May","June","July","August","September","October","November","December"];
			document.querySelector(DOMString.dateLabel).textContent=months[month]+' '+year;
		}

	}

})();
//Global App controller
var controller =(function(budgetCtrl,UICtrl){
	var setupEventListener= function(){
		DOM=UICtrl.getDOMString();
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress',function(event){
		if(event.keyCode ===13 || event.which ===13){
			ctrlAddItem();
		}
	})
		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
	}
	var updgetbudget=function(){
		// 1.Calculate the budget 
		budgetCtrl.calculateBudget();
		// 2.Return the budget
		var budget=budgetCtrl.getBudget();
		//console.log(budget);
		// 3.Display the budget on the UI
		UICtrl.displayBudget(budget);
	}
	var updatePercentage=function(){
		budgetCtrl.calculatePercentage();
		var percentage=budgetCtrl.getPercentage();
		console.log(percentage);
		UICtrl.displayPercentage(percentage);
	}
	var ctrlAddItem = function(){
		var input,newitem;
		// 1.Get the field input data.
		input=UICtrl.getinput();
		if(input.description!=='' && !isNaN(input.value) && input.value >0){
			// 2.Add the item to the budget controller.
		newitem=budgetCtrl.addItem(input.type,input.description,input.value);
		
		// 3.Add the item to the UI.
		UICtrl.addListItem(newitem,input.type);
		// 4.Clear Fields
		UICtrl.clearFields();
		// 5.Calculate the budget
		updgetbudget();
		updatePercentage();
		}
		
		
	}
	var ctrlDeleteItem=function(event){
		var itemID;
		itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splidID=itemID.split('-');
			type=splidID[0];
			ID=parseInt(splidID[1]);
			//Delete the item from data structure
			budgetCtrl.deleteItem(type,ID);
			//delete the tiem from UI
			UICtrl.deleteListItem(itemID);
			//Update and Show the new Budget
			updgetbudget();
		}
	}
	

	return {
		init:function(){
			UICtrl.displayBudget({
				budget:0,
				totalExp:0,
				totalInc:0,
				percentage:-1
			});
			UICtrl.displayMonth();
			setupEventListener();
		}
	}

	
	// var z=budgetCtrl.publicTest(10);

	// return{
	// 	anotherpublicTest:function(){
	// 		console.log(z);
	// 	}
	// }
	
})(budgetController,UIController);

controller.init();