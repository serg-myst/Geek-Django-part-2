from django.urls import path
from mainapp.views import products, ProductDetail

from django.views.decorators.cache import cache_page, never_cache  # Lesson 7

app_name = 'mainapp'
urlpatterns = [

    path('', products, name='products'),
    path('category/<int:id_category>', products, name='category'),
    # path('page/<int:page>', cache_page(3600)(products), name='page'), Lesson 7 кэшируем
    path('page/<int:page>', products, name='page'),
    path('detail/<int:pk>/', ProductDetail.as_view(), name='detail'),
]
