window.onload = function() {

    let total_rows = parseInt(document.querySelector("input[name=orderitems-TOTAL_FORMS]").value);
    let total_quantity = document.getElementsByClassName('order_total_quantity')[0];
    let total_price = document.getElementsByClassName('order_total_cost')[0];

    /*
    console.log(total_rows);
    console.log(total_quantity);
    console.log(total_price);
    */

    for (let i = 0; i < total_rows; i++) {
        document.getElementById('id_orderitems-'+i+'-quantity').addEventListener('click',addQuantity);
    }

    /* Пробежимся по строкам таблицы. Заполним итоговые реквизиты */
    function addQuantity() {
        let quantity = 0;
        let price = 0;
        for (let i = 0; i < total_rows; i++) {
            let price_element = document.getElementsByClassName('orderitems-'+i+'-price');
            if (price_element.length != 0){
                quantity += parseInt(document.getElementById('id_orderitems-'+i+'-quantity').value);
                price += parseInt(price_element[0].innerText.replace(' руб','').replace(',','.')) * quantity;
            }
        }

        total_quantity.innerText = quantity;
        total_price.innerText = price;
    }

}