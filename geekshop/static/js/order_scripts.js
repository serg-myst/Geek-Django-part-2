window.onload = function() {

    total_quantity = document.getElementsByClassName('order_total_quantity')[0];
    total_price = document.getElementsByClassName('order_total_cost')[0];
    delete_rows = []; /* Массив для хранения идентификаторов удаленных строк */

    $orderForm = $('.order_form');
    $orderForm.on('change', 'select', changeProduct);

    /*
    console.log(total_rows);
    console.log(total_quantity);
    console.log(total_price);
    */

    AddListener();

    /* Подключаем обработчик на колонку "Количество". При изменении пересчитываем итог. */
    function AddListener() {
        let total_rows = parseInt(document.querySelector("input[name=orderitems-TOTAL_FORMS]").value)  + delete_rows.length;
        for (let i = 0; i < total_rows; i++) {
            document.getElementById('id_orderitems-' + i + '-quantity').addEventListener('click', Total_Order_Parameters);
        }
    }

    /**
 * Функция прослушивания изменения позиции товара
 * @param event - элемент на который воздействовали
 */
function changeProduct(event) {
    let pkProduct = event.target.value;
    const itemTrParent = event.target.closest('tr');
    console.log(pkProduct);
    if (pkProduct) {
        // Выбран не пустой товар
        $.ajax(
            {
                url: `/orders/product/change/${pkProduct}/`,
                success: function (data) {

                    console.log(data.productPrice);

                    item_id = parseInt(event.target.name.replace('orderitems-', '').replace('-product'));

                    /* Делаем в цикле. Программе меняет классы. Иногда цена в TD1 в другой раз в TD3 */
                    /* Если нет вложенных элементов, тогда это тэг, в котороый надо добавить цену */
                    for (let i = 1; i < 4; i++) {
                        let itemPrice = itemTrParent.querySelector(`.td`+i);
                        if (itemPrice.children.length == 0) {
                            itemPrice.innerHTML = `<span class="orderitems-${item_id}-price">${data.productPrice} руб </span>`;
                        }
                    }
                },
            });
    } else {
        // Выбран пустой товар - ветка удаления
        let btn = itemTrParent.querySelector('.delete-row');
        btn.click();
    }
    event.preventDefault();
    AddListener();
    Total_Order_Parameters();
}

    /* Пробежимся по строкам таблицы. Заполним итоговые реквизиты */
    function Total_Order_Parameters() {
        let quantity = 0;
        let price = 0;
         /* Добавляем длину массива. При удалении в документе строки остаются, но программа общее количество строк меньше на количество удаленных total_rows */
        let total_rows = parseInt(document.querySelector("input[name=orderitems-TOTAL_FORMS]").value) + delete_rows.length;
        for (let i = 0; i < total_rows; i++) {
            let price_element = document.getElementsByClassName('orderitems-'+i+'-price');
            if (price_element.length != 0){
                let current_quantity = parseInt(document.getElementById('id_orderitems-'+i+'-quantity').value);
                /* let current_check_box = document.getElementById('id_orderitems-'+i+'-DELETE').checked; - Если есть checkbox. У нас добавлена кнопка */
                /* if (!current_check_box) - Это, если Удалить = checkbox */
                if (delete_rows.includes(i) === false) {
                    quantity += current_quantity;
                    let current_price = parseInt(price_element[0].innerText.replace(' руб', '').replace(',', '.'));
                    price +=  (current_price * current_quantity);
                }
            }
        }

        total_quantity.innerText = quantity;
        total_price.innerText = number_format(price, 2, ',', ' ');
    }

    /* Служебная функция форматирование числа */
    function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
    }

    function deleteOrderItem(row) {
        /* Получаем идентификатор товара */
        let targetName = row[0].querySelector('input[type="number"]').name;
        let current_id = parseInt(targetName.replace('orderitems-', '').replace('-quantity', ''));
        delete_rows.push(current_id);
        Total_Order_Parameters();
        /* console.log(delete_rows); */
    }

    /* Работа с добавлением новых товаров */
    $('.formset_row').formset({
        addText: 'Добавить продукт',
        deleteText: 'Удалить',
        prefix: 'orderitems',
        removed: deleteOrderItem,
    });


  $('.basket_list').on('click', 'input[type="number"]', function () {
        let t_href = event.target
        $.ajax(
            {
                url: "/baskets/edit/" + t_href.name + "/" + t_href.value + "/",
                success: function (data) {
                    $('.basket_list').html(data.result)
                },
            });
        event.preventDefault()
    })

    $('.card_add_basket').on('click', 'button[type="button"]', function () {
        let t_href = event.target.value
        $.ajax(
            {
                url: "/baskets/add/" + t_href + "/",
                success: function (data) {
                    $('.card_add_basket').html(data.result)
                    alert('товар добавлен вы корзину')
                },
            });
        event.preventDefault()
    })

}