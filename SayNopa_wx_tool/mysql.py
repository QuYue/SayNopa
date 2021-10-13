#!/usr/bin/env python
# -*-coding:utf-8 -*-
'''
@File    :   mysql.py
@Time    :   2021/10/13 04:32:01
@Author  :   QuYue 
@Email   :   quyue1541@gmail.com
@Desc    :   
'''
#%%
from typing import NewType
import pymysql
import pandas as pd

host = 'localhost'
user = 'root'
password = '15415941tc'

#%%
class mysql_connecter():
    def __init__(self, database='saynopa'):
        self.change_database(database)

    def change_database(self, database):
        self.database_name = database
        self.database = pymysql.connect(host=host,
                                user=user,
                                password=password,
                                database=database)
        self.cursor = self.database.cursor()

    def close(self):
        self.database.close()

    def execute(self, sql):
        self.cursor.execute(sql)
    def commit(self):
        self.database.commit()
    def rollback(self):
        self.database.rollback()

    def find_user_openid(self, open_id):
        sql = "select * from user_table where open_id='{}'".format(str(open_id))
        self.execute(sql)
        results= self.cursor.fetchall()
        if len(results) == 0:
            user = None
            status = 'new'
        else:
            user = {'user_id':results[0][0], 'open_id': results[0][1], 'user_name': results[0][2]}
            status = 'exist'
        return status, user

    def add_user_openid(self, open_id):
        if self.find_user_openid(open_id)[0] == 'new':
            sql = "insert into user_table(open_id) values ('{}')".format(str(open_id))
            try:
                self.execute(sql)
                self.commit()
                d = 'success'
            except:
                self.rollback()
                d = 'false'
        else:
            d = 'exist'
        return d

    def clear_table(self, table):
        sql = 'truncate table {}'.format(str(table))
        self.execute(sql)
        self.commit()

#%%
if __name__ == '__main__':
    mc = mysql_connecter()

    
        
    
# %%
