from collections import OrderedDict
from datetime import datetime
from urllib.parse import urlencode, urlunparse
import requests
from django.utils import timezone
from social_core.exceptions import AuthException, AuthForbidden
from authapp.models import UserProfile
import urllib.request
from django.conf import settings
import os


def save_user_profile(backend, user, response, *args, **kwargs):
    if backend.name != 'vk-oauth2':  # соц. сеть отличная от vk
        return

    url_api = urlunparse(('http', 'api.vk.com', 'method/users.get', None,
                          urlencode(OrderedDict(fields=','.join(('bdate', 'sex', 'about', 'personal', 'photo_200')),
                                                access_token=response['access_token'], v=5.131)), None))

    resp = requests.get(url_api)
    if resp.status_code != 200:
        return

    data = resp.json()['response'][0]

    if data['sex'] == 1:
        user.userprofile.gender = UserProfile.FEMALE
    elif data['sex'] == 2:
        user.userprofile.gender = UserProfile.MALE
    else:
        pass

    if data['about']:
        user.userprofile.about = data['about']

    bdate = datetime.strptime(data['bdate'], '%d.%m.%Y').date()
    age = timezone.now().date().year - bdate.year

    user.age = age

    if age < 18:
        user.delete()
        raise AuthForbidden('social_core.backends.vk.VKOAuth2')

    # Получим язык. Находится в personal => langs
    if data['personal']['langs']:
        user.userprofile.langs = ', '.join(data['personal']['langs'])

    # Если нет фото всегда вернет "https://vk.com/images/camera_200.png". Так что проверять не будем
    # Сохраняем на диск и записываем путь к файлу
    img = data['photo_200']
    urllib.request.urlretrieve(img, os.path.join(settings.BASE_DIR, f"media/users_image/photo_{data['id']}.jpg"''))

    user.image = f"users_image/photo_{data['id']}.jpg"

    user.save()
