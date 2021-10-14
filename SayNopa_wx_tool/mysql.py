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
import pymysql
import pandas as pd
import datetime
import time

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
            user = dict()
            status = 'new'
        else:
            user = {'user_id':results[0][0], 'open_id': results[0][1], 'user_name': results[0][2], 'register_time': time.mktime(results[0][3].timetuple()) }
            status = 'exist'
        return status, user

    def add_user_openid(self, open_id):
        if self.find_user_openid(open_id)[0] == 'new':
            sql = "insert into user_table (open_id) values ('{}')".format(str(open_id))
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

    def alter_username_openid(self, open_id, user_name):
        if self.find_user_openid(open_id)[0] == 'new':
            d = {'status':'error'}
        else:
            sql = "update user_table set user_name = '{}' where open_id='{}'" .format(str(user_name), str(open_id))
            try:
                self.execute(sql)
                self.commit()
                d = {'status':'success'}
            except:
                self.rollback()
                d = {'status':'error'}
        return d
    
    def add_file_openid(self, open_id, file_path, save_time):
        file_type = file_path.split('.')[-1]
        result = self.find_user_openid(open_id)
        if result[0] == 'new':
            d = {'status':'error'}
        else:
            sql = "insert into file_table (open_id, user_name, file_path, file_type, save_time) values ('{}', '{}', '{}', '{}', '{}')".format(str(open_id), str(result[1]['user_name']), file_path, file_type, save_time)
            try:
                self.execute(sql)
                self.commit()
                d = {'status':'success'}
            except:
                self.rollback()
                d = {'status':'error'}
        return d

    def find_file(self, file_path):
        sql = "select * from file_table where file_path='{}'".format(file_path)
        self.execute(sql)
        results= self.cursor.fetchall()
        if len(results) == 0:
            user = dict()
            status = 'new'
        else:
            user = {'file_id':results[0][0]}
            status = 'exist'
        return status, user




    def clear_table(self, table):
        sql = 'truncate table {}'.format(str(table))
        self.execute(sql)
        self.commit()

#%%
if __name__ == '__main__':
    mc = mysql_connecter()

    
        
    
# %%
