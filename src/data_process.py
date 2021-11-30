import csv
import sys
from wordcloud import WordCloud
#from PIL import Image
from sklearn.cluster import KMeans
import numpy as np
import io
import re
import time

def wordcloudgen(dp,id_="0",type_="0",meal_only=False):
    img = io.BytesIO()
    font = "Deng.ttf"
    if type_=="shop":
        txt = "?".join([ i[2] for i in dp.comments.get(id_) ])
        if meal_only:
            txt = " ".join( re.findall(" \#(\w+)\#",txt) )
            if len(txt) <10:
                txt = "菜品相关评价不足"
    else:
        #txt = open("bee.txt",'r').read()
        txt = "餐饮词云 好耶 好耶 好耶 好耶"
    wordcloud = WordCloud(font_path=font,width=370,height=350,background_color="white",colormap="hsv").generate(txt).to_image().save(img,format="PNG")
    img.seek(0)
    #print(img)
    return img

class DataProcess():
    def __init__(self):
        self.shops = ShopDetails()
        self.comments = Comments()
        self.users = Users(self.comments)
    def get_all_shops(self,filter_):
        results = []
        sff,sft,pff,pft,cf,ct,uid,tr,kw = filter_

        if uid:
            poiid_li = self.shops.hash_table.keys()
        else:
            poiid_li = self.shops.hash_table.keys()

        for poiid in poiid_li:
            shop = self.shops.hash_table[poiid]
            openTime = shop[5]
            avgScore = shop[2]
            avgPrice = shop[10]
            shop_name = shop[1] 
            shop_add = shop[2]
            shop_coo = (shop[8], shop[9])
            if kw:
                if not kw in shop_name:
                    continue
            if not uid:
                if not poiid in self.comments.poiid_lookup:
                    continue
                if len( self.comments.poiid_lookup[poiid] )<tr:
                    continue
                if openTime[0]>ct or openTime[1]<cf:
                    continue
                if avgScore: 
                    avgScore = float(avgScore)
                    if avgScore<1:
                        avgScore = 1.0
                else:
                    avgScore = 1.0
                if avgScore<sff or avgScore>sft:
                    continue
                if avgPrice: 
                    avgPrice = float(avgPrice)
                    if avgPrice>100:
                        avgPrice = 99
                    if avgPrice<5:
                        avgPrice = 6
                else:
                    avgPrice = 5.0
                if avgPrice<pff or avgPrice>pft:
                    continue
            results.append([ poiid,shop_name,shop_add,shop_coo ])
        return results
    def get_shop_detail(self,poiid):
        result = dict()
        shop_data = self.shops.hash_table[poiid]
        result['name'] = shop_data[1]
        result['avgScore'] = shop_data[2]
        result['address'] = shop_data[3]
        result['phone'] = shop_data[4]
        result['openTime'] = shop_data[5]
        result['extraInfos'] = shop_data[6]
        result['avgPrice'] = shop_data[10]
        result['brandId'] = shop_data[11]
        result['brandName'] = shop_data[12]
        result['stars'] = [0,0,0,0,0]
        result['comments'] = []
        for comment in self.comments.get(poiid):
            if len(comment) <12:
                continue
            star = int(int(comment[-4])/10)
            #print(star)
            try:
                result['stars'][star-1] += 1
            except:
                print(star)
            comment_txt = comment[2]
            comment_uid = comment[-5]
            result['comments'] .append( (comment_txt,comment_uid ))
        result['comments'].sort(key=lambda x: - len(x[0]) )
        result['comments'] = result['comments'][:20]
        result['comments'] = [ i for i in result['comments'] if i[0] ]
        #print(result['comments'])
        return result

class DataLoader():
    '''读取csv文件'''
    def __init__(self,*args,**kwargs):
        super(__class__,self).__init__(*args,**kwargs)
        #self.db = InMemoryDatabase()
        self.hash_table = dict()

    def load(self,fn,key_col):
        '''读取csv文件
        fn:文件名
        key_col:索引所在列
        '''
        f_handle = open(fn,"r")
        csv_reader = csv.reader(f_handle)
        csv_row_count = 0
        print("Loading",fn,'...')
        for row in csv_reader:
            if row[key_col].isnumeric():
                self.hash_table[row[key_col]] = row
                #self.db.insert(row)
            csv_row_count += 1
        print("Csv loaded, {0} rows in csv file, {1} rows in memory.".format(csv_row_count,len(self.hash_table)))
        print("Hash Table memory usage:",int(sys.getsizeof(self.hash_table)/1024),"kb.")

class ShopDetails(DataLoader):
    '''读取商店信息文件 字段:poiid,name,avgScore,address,phone,openTime,extraInfos,hasFoodSafeInfo,longitude,latitude,avgPrice,brandId ,brandName'''
    def __init__(self,*args,**kwargs):
        super(__class__,self).__init__(*args,**kwargs)
        self.load("shop_details.csv",0)
        for poiid in self.hash_table:
            shop = self.hash_table[poiid]
            if len(shop)<13: continue
            open_time_raw = shop[5]
            if "全天" in open_time_raw or len(open_time_raw)<11:
                self.hash_table[poiid][5] = (0,24)
            else:
                #print(open_time_raw)
                re_match = re.search("(\d{1,2}).\d{1,2}.(\d{1,2}).\d{1,2}",open_time_raw)
                open_time = int(re_match.group(1))
                close_time = int(re_match.group(2))
                self.hash_table[poiid][5] = (open_time,close_time)

class Comments(DataLoader):
    '''读取评论信息文件 字段:userName,avgPrice,comment,picUrls,commentTime,zanCnt,userLevel,userId,star,reviewId,anonymous,poiId'''
    def __init__(self,*args,**kwargs):
        super(__class__,self).__init__(*args,**kwargs)
        self.load("shop_comments.csv",9)
        self.poiid_lookup = dict()
        for comment in self.hash_table:
            poiid = self.hash_table[comment][-1]
            if poiid in self.poiid_lookup:
                self.poiid_lookup[poiid].append(self.hash_table[comment])
            else:
                self.poiid_lookup[poiid] = [self.hash_table[comment]]
    
    def get(self,poiid):
        if poiid in self.poiid_lookup:
            if len(self.poiid_lookup[poiid])<1:
                return [[0,0,"数据不足"]]
            return self.poiid_lookup[poiid]
        else:
            return [[0,0,"数据不足"]]

class Users():
    def __init__(self,comments) -> None:
        self.hash_table = dict()
        for comment in comments.hash_table:
            comment = comments.hash_table[comment] 
            if len(comment) <12:
                continue
            uid = comment[-5]
            if uid in self.hash_table:
                self.hash_table[uid]["comments"].append( comment )
            else:
                self.hash_table[uid] = {
                    "comments": [ comment ],
                    "price_range":[0,0,0,0,0],
                    "time_range":[0 for _ in range(12)]
                }

            priceR = min( int(int(comment[1])/15),4)
            #print(priceR)
            self.hash_table[uid]['price_range'][priceR] += 1

            timeR = int( comment[4][:10] )
            timeR = int(timeR/(60*60))%24
            timeR = int(timeR/2)
            self.hash_table[uid]["time_range"][timeR] += 1

def normalize(arr):
    arr = np.array(arr)
    arr= arr/max(arr)
    return arr

class ClusterUtil():
    def __init__(self) -> None:
        self.clusters = []
        self.data = []
    def load_data(self,users,thr=10):
        uid_index = []
        data = []
        for uid in users:
            if len(users[uid]["comments"]) <thr:
                continue
            uid_index.append(uid)
            udata =  normalize( users[uid]["price_range"] )
            udata = np.append( normalize( users[uid]["price_range"] )*2 , normalize( users[uid]["time_range"] )*1 )
            data.append( udata )
        self.data = np.array(data)

    def apply_k_means(self,k):
        kmeans = KMeans(n_clusters=k, random_state=0).fit(self.data)
        print(kmeans.labels_[:100])

TEST_FLAG = True

if TEST_FLAG and __name__ == '__main__':
    users = Users( Comments() )
    for u in list(users.hash_table.keys())[:]:
        #print(u)
        if len(users.hash_table[u]["comments"])>20 and not u=="0":
            #print( users.hash_table[u] )
            pass
    print(len(users.hash_table))
    cluster = ClusterUtil()
    cluster.load_data(users.hash_table)
    cluster.apply_k_means(k=16)
    

