from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.shortcuts import render

import json
import os

from django.views.generic import DetailView

from django.conf import settings
from django.core.cache import cache

from django.views.decorators.cache import cache_page, never_cache

from mainapp.models import Product, ProductCategory

MODULE_DIR = os.path.dirname(__file__)


# Create your views here.

def index(request):
    context = {
        'title': 'Geekshop', }
    return render(request, 'mainapp/index.html', context)


def get_link_category():
    if settings.LOW_CACHE:
        key = 'link_category'
        link_category = cache.get(key)
        if link_category is None:
            link_category = ProductCategory.objects.all()
            cache.set(key, link_category)
        return link_category
    else:
        return ProductCategory.objects.all()


def get_product(id_category=None):
    if settings.LOW_CACHE:
        if id_category:
            key = f'link_product_{id_category}'
            link_product = cache.get(key)
            if link_product is None:
                link_product = Product.objects.filter(category_id=id_category).select_related('category')
                cache.set(key, link_product)
            return link_product
        else:
            key = 'link_product'
            link_product = cache.get(key)
            if link_product is None:
                link_product = Product.objects.all().select_related('category')
                cache.set(key, link_product)
            return link_product
    else:
        return Product.objects.all().select_related('category')


# Lesson 7
def get_product_one(pk):
    if settings.LOW_CACHE:
        key = f'product{pk}'
        product = cache.get(key)
        if product is None:
            product = Product.objects.get(id=pk)
            cache.set(key, product)
        return product
    else:
        return Product.objects.get(id=pk)


@cache_page(3600)  # Lesson 7 кэшируем весь контроллер
# @never_cache  # Lesson 7 выводим из кэша (отключаем)
def products(request, id_category=None, page=1):
    context = {
        'title': 'Geekshop | Каталог',
    }

    if id_category:
        products = Product.objects.filter(category_id=id_category).select_related('category')
        # products = get_product(id_category)  # Lesson 7 Подумать как к кэшу прикрутить фильтрацию по категории
    else:
        products = Product.objects.all().select_related()

    paginator = Paginator(products, per_page=3)

    try:
        products_paginator = paginator.page(page)
    except PageNotAnInteger:
        products_paginator = paginator.page(1)
    except EmptyPage:
        products_paginator = paginator.page(paginator.num_pages)

    context['products'] = products_paginator
    context['categories'] = ProductCategory.objects.all()

    # context['categories'] = get_link_category()  # Lesson 7

    return render(request, 'mainapp/products.html', context)


class ProductDetail(DetailView):
    """
    Контроллер вывода информации о продукте
    """
    model = Product
    template_name = 'mainapp/detail.html'

    # def get_context_data(self, **kwargs):
    #     context = super(ProductDetail, self).get_context_data(**kwargs)
    #     product = self.get_object()
    #     context['product'] = product
    #     return context

    # Lesson 7
    def get_context_data(self, **kwargs):
        context = super(ProductDetail, self).get_context_data(**kwargs)
        # product = self.get_object()
        context['product'] = get_product_one(self.kwargs.get('pk'))
        return context
