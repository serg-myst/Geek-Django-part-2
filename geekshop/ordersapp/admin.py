from django.contrib import admin

# Register your models here.
from ordersapp.models import Order


class OrderAdmin(admin.TabularInline):
    model = Order
    fields = '__all__'
    extra = 0
