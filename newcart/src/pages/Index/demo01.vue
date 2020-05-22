<template>
    <div class="demo01">
        <!-- 组件 -->
        <div class="left">
            <div class="top">组件</div>
            <div class="text-wrapper">
                <draggable
                class="dragArea list-group  element"
                :list="list1"
                :group="{ name: 'people', pull: 'clone', put: false }"
                :clone="cloneShow"
                @change="log"
                >
                <div class="list-group-item item" v-for="item in list1" :key="item.id">
                    {{ item.name }}
                </div>
                </draggable>
            </div>
            
        </div>
        <!-- 中间展示区 -->
        <div class="center">
            <div class="top">中间展示区</div>
            <div class="showElement">
                <!-- 顶部标题和设置 -->
                <div class="showElementTop">
                    <div class="title">{{titleName}}</div>
                    <div class="set" @click="setShowElementTop"></div>
                </div>
                <!-- 中间 -->
                <vue-scroll :ops="ops" style="width:100%;height:100%">
                    <div class="showElementCenter" :style="{'background': `url(${defultBackgroundImg}) no-repeat ${defultBackgroundColor}`,'background-size':'100%'}">
                        <draggable
                        class="dragArea list-group"
                        :list="list2"
                        group="people"
                        @change="log1"
                        style="min-height:500px;"
                        >
                        <div class="list-group-item item"
                        v-for="i in list2" :key="i.id"  
                        :class="{'delStyle':i.name ==''}"                 
                        >
                        <div class="items">
                            <div class="name" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'">{{ i.name }}</div>
                            <!-- 地址样式 -->
                            <div class="name" v-if="i.name ==='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name !== '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'" :style="{'backgroundColor':elementSendStyle,'height':'80px','borderRadius':elementRadius+'px','marginLeft':elementMargin+'px','marginRight':elementMargin+'px','paddingLeft':elementPadding+'px','paddingRight':elementPadding+'px'}">
                                <span :style="{'color':elementTitleColorStyle}">{{ i.name }}:</span>
                                <span :style="{'color':elementColorStyle}" >{{ i.site }}</span> 
                            </div>
                            <!-- 电话 -->
                            <div class="name" v-if="i.name !=='地址'&&i.name ==='电话'&&i.name !== '请添加新闻资讯'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name !== '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'" :style="{'backgroundColor':elementSendPhoneStyle,'height':'100px','borderRadius':elementSendPhoneRadius+'px','marginLeft':elementSendPhoneMargin+'px','marginRight':elementSendPhoneMargin+'px','paddingLeft':elementSendPhonePadding+'px','paddingRight':elementSendPhonePadding+'px'}">
                                <span :style="{'color':elementSendPhoneTitleColorStyle}">{{ PhoneTitle }}:</span>
                                <span :style="{'color':elementSendPhoneColorStyle}" >{{ SendPhone }}</span> 
                            </div>
                            <!-- 图片 -->
                            <div class="name" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name==='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name !== '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'" :style="{'backgroundColor':pictureStyles,'borderRadius':pictureSendPhoneRadius+'px','marginLeft':pictureSendPhoneMargin+'px','marginRight':pictureSendPhoneMargin+'px','paddingLeft':pictureSendPhonePadding+'px','paddingRight':pictureSendPhonePadding+'px'}"> 
                                <div style=" width: 100%;text-align: center;"><img style="width: 100%; height: 100%; text-align: center; display: block; border-radius: 0px;" src="../../assets/imgs/picture.png" alt=""></div>
                            </div>
                            <!-- 新闻资讯 -->
                            <div class="name" v-if="i.name === '请添加新闻资讯' && i.name !=='地址'&&i.name!=='电话'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name !== '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'" :style="{'backgroundColor':elementNewStyle}">{{ i.name }}</div>
                            <!-- 富文本编辑 -->
                            <div class="name" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name === '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name !== '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'" :style="{'min-height':'20px'}"></div>
                            <!-- 视频编辑 -->
                            <div class="name" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '图文广告'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name === '视频'&&i.name !=='文本'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'" :style="{'height':'200px','backgroundColor':'currentcolor'}"><video ></video></div>
                            <!-- 文本 -->
                            <div class="name" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name ==='文本'&&i.name !== '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'" :style="{'backgroundColor':TextBackgroundColor,'borderRadius':TextRadius+'px','marginLeft':TextMargin+'px','marginRight':TextMargin+'px','paddingLeft':TextPadding+'px','paddingRight':TextPadding+'px','min-height':'20px'}"> 
                                <div :style="{ 'width': '100%','text-align': TextsideRadio,'font-size':TextRadio+'px','color': TextFontColor ,'font-weight':TextStrong}">{{ TextTextarea }}</div>
                            </div>
                            <!-- 辅助线样式 -->
                            <div class="name" v-if="i.name === ''" :style="{'backgroundColor':sublineBackgroundColor,'paddingLeft':sublinePadding+'px','paddingRight':sublinePadding+'px','padding-top': '10px','padding-bottom':'10px'}">
                                <div  :style="{'border-top': `${sublineThickness}px ${sublineStyleRadio} ${sublineColor}`,'margin-bottom':'1px' }"></div>
                            </div>

                            <!-- 图文广告模板1 -->
                            <div class="name"  v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name === '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&imageTextchangeTemplate ===1" :style="{'backgroundColor':imageTextBackgroundColor,'borderRadius':imageTextBackgroungRadius+'px','marginLeft':imageTextMargin+'px','marginRight':imageTextMargin+'px','paddingLeft':imageTextPadding+'px','paddingRight':imageTextPadding+'px',}">
                                <div :style=" {'backgroundColor':imageTextOnebackgroundColor,'width': '100%','height': '100%','borderRadius':imageTextOneRadius+'px',}"><img :style="{'borderRadius':imageTextRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                            </div>
                            <!-- 图文广告模板2 -->
                            <div class="name"  v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name === '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&imageTextchangeTemplate ===2" :style="{'backgroundColor':imageTextBackgroundColor,'borderRadius':imageTextBackgroungRadius+'px','marginLeft':imageTextMargin+'px','marginRight':imageTextMargin+'px','paddingLeft':imageTextPadding+'px','paddingRight':imageTextPadding+'px','display':'flex'}">
                                <!-- <div v-for="(i,k) in imageTextList" :key="k" style="display:flex">
                                    <div :style=" {'backgroundColor':imageTextOnebackgroundColor,'width': '80%','height': '100%','borderRadius':imageTextOneRadius+'px','margin':'0 5px'}">
                                        <img :style="{'borderRadius':imageTextRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt="">
                                        <span  :style=" {'color':imageTextTitle1Color,}">{{i.imageTextTitle}}</span><br>
                                        <span :style=" {'color':imageTextPrice1Color,}">{{i.imageTextPrice}}</span>
                                    </div>
                                </div> -->
                                <div :style=" {'backgroundColor':imageTextOnebackgroundColor,'width': '80%','height': '100%','borderRadius':imageTextOneRadius+'px','margin':'0 5px'}">
                                    <img :style="{'borderRadius':imageTextRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt="">
                                    <span  :style=" {'color':imageTextTitleColor,}">{{imageTextTitle1}}</span><br>
                                    <span :style=" {'color':imageTextPriceColor,}">{{imageTextPrice1}}</span>
                                </div>
                                <div :style=" {'backgroundColor':imageTextOnebackgroundColor,'width': '20%','height': '100%','overflow': 'hidden','borderRadius':imageTextOneRadius+'px',}">
                                    <img :style="{'borderRadius':imageTextRadius+'px','width': '244px','height': '170px'}" src="../../assets/imgs/imageText.png" alt="">
                                    <span :style=" {'color':imageTextTitleColor,}">{{imageTextTitle2}}</span><br>
                                    <span :style=" {'color':imageTextPriceColor,}">{{imageTextPrice2}}</span>
                                </div>
                            </div>
                            <!-- 图文广告模板3 -->
                            <div class="name"  v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name === '图文广告'&&i.name !== '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&imageTextchangeTemplate ===3" :style="{'backgroundColor':imageTextBackgroundColor,'borderRadius':imageTextBackgroungRadius+'px','marginLeft':imageTextMargin+'px','marginRight':imageTextMargin+'px','paddingLeft':imageTextPadding+'px','paddingRight':imageTextPadding+'px','display':'flex'}">
                                <div :style=" {'margin-left': '5px','backgroundColor':imageTextOnebackgroundColor,'width': '44%','height': '100%','borderRadius':imageTextOneRadius+'px',}">
                                    <img :style="{'borderRadius':imageTextRadius+'px','width': '100%','height': '120px'}" src="../../assets/imgs/imageText.png" alt="">
                                    <span :style=" {'color':imageTextTitleColor,}">{{imageTextTitle1}}</span><br>
                                    <span :style=" {'color':imageTextPriceColor,}">{{imageTextPrice1}}</span>
                                </div>
                                <div :style=" {'margin-left': '5px','backgroundColor':imageTextOnebackgroundColor,'width': '44%','height': '100%','borderRadius':imageTextOneRadius+'px',}">
                                    <img :style="{'borderRadius':imageTextRadius+'px','width': '100%','height': '120px'}" src="../../assets/imgs/imageText.png" alt="">
                                    <span :style=" {'color':imageTextTitleColor,}">{{imageTextTitle2}}</span><br>
                                    <span :style=" {'color':imageTextPriceColor,}">{{imageTextPrice2}}</span>
                                </div>
                                <div :style=" {'margin-left': '5px','backgroundColor':imageTextOnebackgroundColor,'width': '12%','height': '100%','overflow': 'hidden','borderRadius':imageTextOneRadius+'px',}">
                                    <img :style="{'borderRadius':imageTextRadius+'px','width': '132px','height': '120px'}" src="../../assets/imgs/imageText.png" alt="">
                                    <span :style=" {'color':imageTextTitleColor,}">{{imageTextTitle3}}</span><br>
                                    <span :style=" {'color':imageTextPriceColor,}">{{imageTextPrice3}}</span>
                                </div>
                            </div>

                            <!-- 营销活动1 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助'&&marketingCampaignchangeTemplate ===1" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','overflow': 'hidden'}">
                                <div :style="{'width': '100%','height': '100%',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                            </div>
                            <!-- 营销活动2 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===2" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','overflow': 'hidden'}">
                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': marketwideRadius+'%','height': '120px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                <div :style="{'width': marketwideRadius+'%','height': '120px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px',}" src="../../assets/imgs/imageText.png" alt=""></div>
                            </div>
                            <!-- 营销活动3 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===3" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','flex-wrap': 'wrap'}">
                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': marketwideRadius+'%','height': '120px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': marketwideRadius+'%','height': '120px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                <div :style="{'width': marketwideRadius+'%','height': '120px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px',}" src="../../assets/imgs/imageText.png" alt=""></div>
                            </div>
                            <!-- 营销活动4 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===4" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','overflow': 'hidden','display':'flex'}">

                                <div :style="{'marginRight':'10px' ,'width': '49%','height': '180px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>

                                <div style="display：flex;flex-direction: column;justify-content: space-between;width: 49%;height: 180px">
                                    <div :style="{'height': '85px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                    <div :style="{'height': '85px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px','margin-top':'10px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                </div>
                                
                            </div>
                            <!-- 营销活动5 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===5" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','overflow': 'hidden','display':'flex','flex-direction': 'column'}">

                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': '100%','height': '120px','margin-bottom': '10px'}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>

                                <div style="justify-content: space-between;display:flex;">
                                    <div :style="{'width': '48%','height': '90px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                    <div :style="{ 'width': '48%','height': '90px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                </div>
                                
                            </div>
                            <!-- 营销活动6 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===6" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','overflow': 'hidden','display':'flex','flex-direction': 'column'}">

                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': '100%','height': '120px','margin-bottom': '10px'}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>

                                <div style="justify-content: space-between;display:flex;">
                                    <div :style="{'width': '31.2%','height': '90px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                    <div :style="{ 'width': '31.2%','height': '90px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                    <div :style="{ 'width': '31.2%','height': '90px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                </div>
                                
                            </div>
                            <!-- 营销活动7 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===7" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','overflow': 'hidden','display':'flex','flex-direction': 'column'}">
                                <div style="justify-content: space-between;display:flex;">
                                    <div :style="{'width': '48%','height': '90px','margin-bottom': '10px'}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                    <div :style="{'width': '48%','height': '90px','margin-bottom': '10px'}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                </div>

                                <div style="justify-content: space-between;display:flex;">
                                    <div :style="{ 'width': '48%','height': '90px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                    <div :style="{ 'width': '48%','height': '90px',}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                </div>
                                
                            </div>
                            <!-- 营销活动8 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===8" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','overflow': 'hidden','display':'flex'}">

                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': '49%','height': '180px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>

                                <div style="display：flex;flex-direction: column;justify-content: space-between;width: 49%;height: 180px">
                                    <div :style="{'height': '85px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>

                                    <div style="display:flex;justify-content: space-between;height: 85px;margin-top: 10px">
                                        <div :style="{'width': '49%'}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                        <div :style="{'width': '49%'}"><img :style="{'width': '100%','height': '100%','borderRadius':marketOneRadius+'px'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                    </div>
                                </div>
                                
                            </div>

                            <!-- 营销活动9 -->
                            <div class="names" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name === '营销活动'&&i.name!=='标题'&&i.name !== '空白辅助' &&marketingCampaignchangeTemplate ===9" :style="{'backgroundColor':marketgroundColor,'paddingLeft':marketPadding+'px','paddingRight':marketPadding+'px','borderRadius':marketgroundRadio+'px','marginLeft':marketMargin+'px','marginRight':marketMargin+'px','flex-wrap': 'wrap'}">
                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': marketwideRadius+'%','height': '120px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': marketwideRadius+'%','height': '120px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': marketwideRadius+'%','height': '120px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                                <div :style="{'marginRight':marketspaceBetweenRadius+'px' ,'width': marketwideRadius+'%','height': '120px',}"><img :style="{'borderRadius':marketOneRadius+'px','width': '100%','height': '100%'}" src="../../assets/imgs/imageText.png" alt=""></div>
                            </div>

                            <!-- 标题 -->
                            <div class="name" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name !== '图文广告'&&i.name==='标题'&&i.name !== '营销活动'&&i.name !== '空白辅助'" :style="{'backgroundColor':titleBackgroundColor,'border-radius':titleRadius+'px','marginLeft':titleMargin+'px','marginRight':titleMargin+'px','paddingLeft':titlePadding+'px','paddingRight':titlePadding+'px','min-height':'18px'}"> 
                                <div :style="{ 'width': '100%','text-align': titlesideRadio,'font-size':'24px','color': titleFontColor}">{{ titleStyleText }}
                                    <div :style="{'font-size':'14px',}">{{subheadtextareaText}}</div>
                                </div>
                            </div>

                            <!-- 空白辅助 -->
                            <div class="name" v-if="i.name !=='地址'&&i.name!=='电话'&&i.name !== '请添加新闻资讯'&&i.name!=='图片'&&i.name !== '富文本'&&i.name !== '视频'&&i.name !=='文本'&&i.name!==''&&i.name !== '图文广告'&&i.name!=='标题'&&i.name !== '营销活动'&&i.name === '空白辅助'" :style="{'backgroundColor':blankAssistBackgroundColor,'height': currentValueHeigthRadius +'px'}"></div>
                            <!-- <div  v-if="i.name === ''" :style="{'backgroundColor':sublineBackgroundColor,'paddingLeft':sublinePadding+'px','paddingRight':sublinePadding+'px', 'margin-top': '10px', 'margin-left': '5%',}"></div> -->
                        </div>
                        <!-- <i class="del" @click="delElement(i)" v-show="i.name ==='地址'&&i.name!=='电话'" :style="{'backgroundColor':elementSendStyle}"></i> 
                        <i class="del" @click="delElement(i)" v-show="i.name !=='地址'&&i.name ==='电话'" :style="{'backgroundColor':elementSendPhoneStyle}"></i>  -->
                        <!-- <i class="del" @click="delElement(i)" v-show="i.name !=='地址'&&i.name!=='电话'"></i>  -->
                        <i class="del" @click="delElement(i)"></i> 
                        </div>
                        </draggable> 
                    </div>                    
                </vue-scroll>

            </div>
            <div class="clear">
                <!-- 清空组件 -->
                <el-button type="primary" style="margin-top:100px;" @click="clearElement">清空组件</el-button>
            </div>
        </div>
        <!-- 右边编辑 -->
        <div class="right">
            <div class="top">右边编辑区</div>
            <!-- 默认样式 -->
            <div v-if="defultStyle" class="setStyle">
                <div class="titleName">网页编辑</div>
                <div class="redact">默认设置</div>
                <!-- 标题 -->
                <div class="title">
                    <div>标题名称：</div>
                    <el-input
                    placeholder="请输入内容"
                    v-model="titleName"
                    clearable>
                    </el-input>
                </div>
                <!-- 背景色 -->
                <div class="background">
                    <div> 背景色: </div>
                    <div class="btn">
                        <el-color-picker v-model="color" ref="defultBackgroundColor"></el-color-picker>
                        <!-- <colorPicker v-model="color"  ref="defultBackgroundColor"></colorPicker>  -->
                        <div class="reset" @click="resetDefultBackgroundColor">重置</div>
                    </div>                   
                </div>
                <!-- 全屏展示 -->
                <div class="full-screen">
                    <div> 全屏展示: </div>
                    <div class="set-full-screen" @change="change">
                        <el-switch
                        v-model="fullScreen"
                        active-color="#2692ff"
                        inactive-color="#eee"
                        >
                        </el-switch>
                        <div v-bind:style="{'color': fullScreen ?'#2692ff':'#606266'}">全屏显示</div>
                    </div>
                </div>
                <!-- 背景图片 -->
                <div class="background-img">
                    <div class="backgroundImgsText"> 背景图片: </div>
                    <div class="backgroundImgs"  @click="centerDialogVisible = true">
                        <i class="el-icon-plus"></i>
                    </div>                   
                </div>
            </div>
            <!-- 样式列表 -->
            <div>
                <!-- 优惠卷样式 -->
                <discounts v-if="discountsStyle" />
                <!-- 样式 -->
                <defultStyle v-if="elementDefultStyle"/>
                <!-- 文本 -->
                <textStyle v-if="textStyle" @getData="getData" @radio='radio' @textarea='textarea' @fontColor='fontColor' @strong='strong' @sideRadio='sideRadio' @radius="radius" @margin='margin' @padding='padding' />
                <!-- 地址 -->
                <siteStyle v-if="siteStyle" @getData="getData" @setTitleColor="setTitleColor" @setsitesColor="setsitesColor" @radius="radius" @margin='margin' @padding='padding' />
                <!-- 电话 -->
                <phoneStyle v-if="phoneStyle" @SendPhones='getPhone' @getData="getData" @setTitleColor="setTitleColor" @phoneColor="phoneColor" @radius="radius" @margin='margin' @padding='padding' />
                <!-- 辅助线 -->
                <sublineStyle v-if="sublineStyle" @getData="getData" @padding='padding' @colors='colors' @styleRadio='styleRadio' @thickness='thickness' />
                <!-- 图片 -->
                <pictureStyle v-if="pictureStyle" @getData="getData" @radius="radius" @margin='margin' @padding='padding' />
                <!-- 新闻样式 -->
                <newsInformation v-if="newsInformation" @getData="getData"  />
                <!-- 富文本样式 -->
                <richText v-if="richText" />
                <!-- 视频样式 -->
                <videoStyle v-if="videoStyle" />

                <!-- 图文广告 -->
                <imageTextAdvertising v-if="imageTextAdvertising" @onebackgroundColor='onebackgroundColor' @radius='radius' @getData="getData" @oneRadius='oneRadius' @backgroundRadius='backgroundRadius' @margin='margin' @padding='padding' @changeTemplate ='changeTemplate' @titleInput='titleInput' @setTitleColor='setTitleColor' @setPriceColor='setPriceColor' />

                <!-- 营销活动 -->
                <marketingCampaign v-if="marketingCampaign" @getData="getData" @margin='margin' @changeTemplate ='changeTemplate' @padding='padding' @radius="radius" @spaceBetweenRadius="spaceBetweenRadius" @wideRadius = 'wideRadius' @oneRadius='oneRadius' />
                <!-- 标题商品 -->
                <labelCommodity v-if="labelCommodity"  />
                <!-- 标题编辑 -->
                <titleStyle v-if="titleStyle" @textarea='textarea' @getData="getData" @sideRadio='sideRadio' @radius="radius" @subheadtextarea="subheadtextarea"  @fontColor='fontColor' @margin='margin' @padding='padding' />
                <!-- 图文导航 -->
                <imageTextLabel v-if="imageTextLabel" />
                <!-- 空白辅助 -->
                <blankAssist v-if="blankAssist" @getData="getData" @radius="radius" />
                <!-- 商品 -->
                <commodityStyle v-if="commodityStyle" />
            </div>           
        </div>
        <!-- 点击背景图片的表单 -->
        <el-dialog title="图库" :visible.sync="centerDialogVisible" width="860px" center>
          <mapDepot />
          <!-- 确定和取消按钮 -->
          <div class="footer">
            <span slot="footer" class="dialog-footer">
              <el-button @click="centerDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
            </span>
          </div>
        </el-dialog>
    </div>
</template>

<script>
import draggable from "vuedraggable";
import discounts from "../../components/discounts";
import defultStyle from '../../components/defultStyle'
import textStyle from '../../components/textStyle'
import siteStyle from '../../components/siteStyle'
import phoneStyle from '../../components/phoneStyle'
import sublineStyle from '../../components/sublineStyle'
import pictureStyle from '../../components/pictureStyle'
import newsInformation from '../../components/newsInformation'
import richText from '../../components/richText'
import videoStyle from '../../components/videoStyle'
import imageTextAdvertising from '../../components/imageTextAdvertising'
import marketingCampaign from '../../components/marketingCampaign'
import labelCommodity from '../../components/labelCommodity'
import titleStyle from '../../components/titleStyle'
import imageTextLabel from '../../components/imageTextLabel'
import blankAssist from '../../components/blankAssist'
import commodityStyle from '../../components/commodityStyle'

import mapDepot from "../../components/mapDepot";

export default {
  order: 3,
  components: {
    draggable,//拖拽
    discounts,//优惠卷样式
    defultStyle,//默认样式
    textStyle,//文本样式
    siteStyle,//地址样式
    phoneStyle,//电话样式
    sublineStyle,//辅助线样式
    pictureStyle,//图片样式
    newsInformation,//新闻样式
    richText,//富文本样式
    videoStyle,//视频样式
    imageTextAdvertising,//图文广告样式
    marketingCampaign,//营销活动样式
    labelCommodity,//标签商品样式
    titleStyle,//标题样式
    imageTextLabel,//图文导航样式
    blankAssist,//空白辅助样式
    commodityStyle,//商品样式
    mapDepot
  },
  data() {
        return {
            ops: {
                vuescroll: {},
                scrollPanel: {},
                rail: {
                keepShow: true
                },
                bar: {
                hoverStyle: true,
                onlyShowBarOnScroll: false, //是否只有滚动的时候才显示滚动条
                background: "#000",//滚动条颜色
                opacity: 0.5,//滚动条透明度
                "overflow-x": "hidden"
                }
            },
            list1: [
                { name: "优惠券", id: 1 },
                { name: "地址", id: 2 },
                { name: "电话", id: 3 },
                { name: "新闻资讯", id: 4 },
                { name: "图片", id: 5 },
                { name: "富文本", id: 6 },
                { name: "视频", id: 7 },
                { name: "文本", id: 8 },
                { name: "辅助线", id: 9 },
                { name: "图文广告", id: 10 },
                { name: "营销活动", id: 11 },
                { name: "标签商品", id: 12 },
                { name: "标题", id: 13 },
                { name: "图文导航", id: 14 },
                { name: "空白辅助", id: 15 },
                { name: "商品", id: 16 },
            ],
        list2: [],
        titleName:'仙剑',
        defultStyle:true,//默认右边编辑显示
        discountsStyle:false,//选择优惠卷样式
        fullScreen:true,//全屏显示
        imageUrl: '',//上传图片
        elementName:'',//组件名称
        elementDefultStyle:false,//默认样式
        color: '',//样色表的使用
        defultBackgroundColor:"#eee",//默认背景色
        // defultBackgroundImg:'img/login.d3c4bad8.png',//默认背景图
        defultBackgroundImg:'',//默认背景颜色
        centerDialogVisible: false,//默认设置的点击背景图片的开关
        searchInput:'',//搜索图片框
        // pagers:10,//图片数量
            // imagesList:[
            //     {url:'/img/login.d3c4bad8.png',id:1},
            //     {url:'/img/30.f1e6f8d4.jpg',id:2},
            //     {url:'/img/31.d983e4f3.jpg',id:3},
            //     {url:'/img/32.0abd6721.jpg',id:4},
            //     {url:'/img/33.d962cfe4.jpg',id:5},
            //     {url:'/img/34.44c20bef.jpg',id:6},
            //     {url:'/img/35.2afe101f.jpg',id:7},
            //     {url:'/img/36.a94f52d8.jpg',id:8},
            //     {url:'/img/34.44c20bef.jpg',id:9},
            //     {url:'/img/31.d983e4f3.jpg',id:10},
            //     {url:'/img/33.d962cfe4.jpg',id:11},
            // ],
            // groupingList:[
            //     {id:1,name:'全部分组'},
            //     {id:2,name:'未分组'},
            // ],//分组列表
    // 组件样式
        addGrouping:false,
        addGroupingName:'',
        textStyle:false,//文本样式
        siteStyle:false,//地址样式
        phoneStyle:false,//电话样式
        sublineStyle:false,//辅助线样式
        pictureStyle:false,//图片样式
        newsInformation:false,//新闻样式
        richText:false,//新闻样式
        videoStyle:false,//视频样式
        imageTextAdvertising:false,//图文广告样式
        marketingCampaign:false,//营销活动样式
        labelCommodity:false,//标题商品样式
        titleStyle:false,//标题样式
        imageTextLabel:false,//图文导航样式
        blankAssist:false,//空白辅助样式
        commodityStyle:false,//商品样式
    // 组件传值来的样式
        elementSendStyle:'#eee',//拖拽组件的默认背景颜色
        elementTitleColorStyle:'#000',//地址的默认标题字体颜色
        elementColorStyle:'#000',//地址的默认字体颜色
        elementRadius:0,//拖拽组件的默认圆角大小
        elementMargin:0,//拖拽组件的默认外边距大小
        elementPadding:0,//拖拽组件的默认内边距大小
        elementSendPhoneStyle:'#eee',//拖拽组件的电话默认背景颜色
        PhoneTitle:'联系电话',//联系电话
        SendPhone:'',//电话
        elementSendPhoneTitleColorStyle:'#000',//拖拽组件电话的默认标题字体颜色
        elementSendPhoneColorStyle:'#000',//拖拽电话组件的默认字体颜色
        elementSendPhoneRadius:0,//拖拽电话组件的默认圆角大小
        elementSendPhoneMargin:0,//拖拽组件电话的默认外边距大小
        elementSendPhonePadding:0,//拖拽组件电话的默认内边距大小
        elementNewStyle:'#eee',//新闻背景默认颜色
        pictureStyles:'#eee',//图片的默认背景颜色
        pictureSendPhoneRadius:0,//图片的默认圆角大小
        pictureSendPhoneMargin:0,//图片的默认内边距
        pictureSendPhonePadding:0,//图片的默认外边距
        TextBackgroundColor:'#eee',//文本的默认背景颜色
        TextRadius:0,//文本的默认圆角大小
        TextMargin:0,//文本的默认外边距
        TextPadding:0,//文本的默认内边
        TextRadio:24,//文本的字体大小
        TextsideRadio:'left',//文本的显示位置
        TextFontColor:'#000',//文本的默认字体颜色
        TextStrong:'',//文本字体是否加粗
        TextTextarea:'',//文本的内容
        sublineBackgroundColor:'#eee',//辅助线的默认背景颜色
        sublineColor:'#000',//辅助线的默认颜色
        sublineStyleRadio:'solid',//辅助线的默认样式（实虚线）
        sublinePadding:10,//辅助线的默认边距
        sublineThickness:1,//辅助线的粗细
        
        imageTextBackgroundColor:'',//图文广告默认背景色
        imageTextOnebackgroundColor:'',//图文广告默认单个背景色
        imageTextBackgroungRadius:0,//图文广告默认背景圆角
        imageTextRadius:0,//图文广告图片圆角
        imageTextMargin:'',//图文广告外边距
        imageTextPadding:'',//图文广告内边距
        imageTextOneRadius:0,//单个图文圆角
        imageTextchangeTemplate:1,//图文广告的模板
        imageTextTitleColor:'#000',//图文广告标题颜色
        imageTextTitle1:1,//图文广告标题1
        imageTextTitle2:20,//图文广告标题2
        imageTextTitle3:30,//图文广告标题3
        imageTextPrice1:100,//图文广告价格1
        imageTextPriceColor:'#000',//图文广告价格颜色
        imageTextPrice2:100,//图文广告价格2
        imageTextPrice3:100,//图文广告价格3
        imageTextList:[
            {'imageTextTitle':1,'imageTextPrice':10},
            {'imageTextTitle':2,'imageTextPrice':20},
            {'imageTextTitle':3,'imageTextPrice':30},
        ],//图文广告图文内容

        marketgroundColor:'',//营销活动背景色
        marketMargin:0,//营销活动外边距
        marketPadding:10,//营销活动内边距
        marketgroundRadio:0,//营销活动背景圆角
        marketspaceBetweenRadius:10,//营销活动图片间距
        marketwideRadius:50,//营销活动图片宽度
        marketingCampaignchangeTemplate:2,//营销活动模板

        titleStyleText:'',//标题内容
        subheadtextareaText:'',//副标题内容
        titleBackgroundColor:'',//标题背景颜色
        titleRadius:0,//标题圆角
        marketOneRadius:0,//单个图片的圆角
        titleMargin:0,//标题外边距
        titlePadding:0,//标题内边距
        titlesideRadio:'left',//标题显示的位置

        titleFontColor:'#000',//文本的默认字体颜色
        blankAssistBackgroundColor:'',//空白辅助背景颜色
        currentValueHeigthRadius:18//空白辅助的高度
        };
  },
  created:function(){
      this.SendPhone = '13194782515'
  },
    methods: {
        log: function(evt) {
            //   window.console.log(evt);
            window.console.log(222,evt);
        },
        log1(evt) {
            window.console.log(111,evt)
        },
        // 判定拖拽的文件
        cloneShow({ name }){  
            // console.log(name)
            if(name === '优惠券'){
                this.defultStyle = false;
                this.discountsStyle = true
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name:`${ name }`
                }
            }  
            else if(name === '地址' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.textStyle = false;
                this.siteStyle = true;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`,
                    site:'四川省成都市双流县海滨广场11座7楼'
                }
            }
            else if(name === '电话' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.textStyle = false;
                this.siteStyle = false;
                this.phoneStyle = true;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`,
                    // phone:'13194782515'
                }
            }
            else if(name === '新闻资讯' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.textStyle = false;
                this.siteStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=true;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    // name: `${ name }`
                    name:'请添加新闻资讯'
                }
            }
            else if(name === '图片' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.textStyle = false;
                this.siteStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = true;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }
            else if(name === '富文本' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.textStyle = false;
                this.siteStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.richText=true;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }
            else if(name === '视频' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.textStyle = false;
                this.imageTextAdvertising = false;
                this.marketingCampaign = false;
                this.videoStyle = true;
                this.labelCommodity = false;
                this.titleStyle = false;
                this.imageTextLabel = false;
                this.blankAssist = false;
                this.commodityStyle = false;
                return{
                    name: `${ name }`
                }
            }
            else if(name === '文本' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = true;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }
            else if(name === '辅助线' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.phoneStyle = false;
                this.textStyle = false;
                this.sublineStyle = true;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    // name: `${ name }`
                    name:'',
                }
            }   
            else if(name === '图文广告' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.imageTextAdvertising=true;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }    
            else if(name === '营销活动' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.labelCommodity=false;
                this.marketingCampaign=true;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }    
            else if(name === '标签商品' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=true;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }    
            else if(name === '标题' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.titleStyle=true;
                this.labelCommodity=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }    
            else if(name === '图文导航' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.imageTextLabel=true;
                this.titleStyle=false;
                this.blankAssist=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }    
            else if(name === '空白辅助' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.blankAssist=true;
                this.imageTextLabel=false;
                this.commodityStyle=false;
                return{
                    name: `${ name }`
                }
            }    
            else if(name === '商品' ){
                this.defultStyle = false;
                this.discountsStyle = false;
                this.elementDefultStyle = false;
                this.siteStyle = false;
                this.textStyle = false;
                this.phoneStyle = false;
                this.sublineStyle = false;
                this.pictureStyle = false;
                this.newsInformation=false;
                this.richText=false;
                this.videoStyle=false;
                this.imageTextAdvertising=false;
                this.marketingCampaign=false;
                this.labelCommodity=false;
                this.titleStyle=false;
                this.imageTextLabel=false;
                this.blankAssist=false;
                this.commodityStyle=true;
                return{
                    name: `${ name }`
                }
            } 
        },
        // 点击顶部设置
        setShowElementTop(){
            this.defultStyle = true
            this.discountsStyle = false;
            this.elementDefultStyle = false;
            this.textStyle = false;
            this.siteStyle = false;
            this.phoneStyle = false;
            this.sublineStyle = false;
            this.pictureStyle = false;
            this.newsInformation=false;
            this.richText=false;
            this.videoStyle=false;
            this.imageTextAdvertising=false;
            this.marketingCampaign=false;
            this.labelCommodity=false;
            this.titleStyle=false;
            this.imageTextLabel=false;
            this.blankAssist=false;
            this.commodityStyle=false;
        },
        // 点击删除
        delElement(item){
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item.name){
                    this.list2.splice(i,1)
                    if(this.list2.length == 0){
                        this.defultStyle = true;
                        this.discountsStyle = false;
                        this.elementDefultStyle = false;
                        this.textStyle = false;
                        this.siteStyle = false;
                        this.phoneStyle = false;
                        this.sublineStyle = false;
                        this.pictureStyle = false;
                        this.newsInformation=false;
                        this.richText=false;
                        this.videoStyle=false;
                        this.imageTextAdvertising=false;
                        this.marketingCampaign=false;
                        this.labelCommodity=false;
                        this.titleStyle=false;
                        this.imageTextLabel=false;
                        this.blankAssist=false;
                        this.commodityStyle=false;
                    }else{
                        this.defultStyle = false;
                        this.discountsStyle = false;
                        this.elementDefultStyle = false;
                        this.textStyle = false;
                        this.siteStyle = false;
                        this.phoneStyle = false;
                        this.sublineStyle = false;
                        this.pictureStyle = false;
                        this.newsInformation=false;
                        this.richText=false;
                        this.videoStyle=false;
                        this.imageTextAdvertising=false;
                        this.marketingCampaign=false;
                        this.labelCommodity=false;
                        this.titleStyle=false;
                        this.imageTextLabel=false;
                        this.blankAssist=false;
                        this.commodityStyle=false;                        
                    }
                    return true;
                }
            }
        },
        // 点击重置默认背景颜色
        resetDefultBackgroundColor(){
            // 重置默认背景颜色
            this.defultBackgroundColor = "#eee"
            this.color = this.defultBackgroundColor
            // console.log(this.$refs.defultBackgroundColor.$el.firstElementChild.firstElementChild.firstChild.style.backgroundColor)
            // console.log(this.color)
            // this.$refs.defultBackgroundColor.$el.firstElementChild.firstElementChild.firstChild.style.backgroundColor = this.defultBackgroundColor
            // this.$refs.defultBackgroundColor.$el.firstElementChild.firstElementChild.firstChild.style.backgroundColor = this.defultBackgroundColor
            // console.log(this.$refs.defultBackgroundColor.$refs.colorPicker.children[2].firstChild.firstChild.style.backgroundColor)
            // this.$refs.defultBackgroundColor.$refs.colorPicker.children[2].firstChild.firstChild.style.backgroundColor = this.defultBackgroundColor
        },
        // 点击全屏显示的启动
        change(){
            console.log(this.fullScreen)
        },
        // 点击上传图片
        handleChange(file, fileList) {
            this.fileList = fileList.slice(-3);
        },
        // 获取电话
        getPhone(data,item){
            if(item ==='电话'){
                this.SendPhone = data
            }
        },
        // 点击清空组件按钮
        clearElement(){
            this.list2 = []
            this.defultStyle = true;
            this.discountsStyle = false
            this.elementDefultStyle = false;
            this.siteStyle = false;
            this.textStyle = false;
            this.phoneStyle = false;
            this.sublineStyle = false;
            this.pictureStyle = false;
            this.newsInformation=false;
            this.richText=false;
            this.videoStyle=false;
            this.imageTextAdvertising=false;
            this.marketingCampaign=false;
            this.labelCommodity=false;
            this.titleStyle=false;
            this.imageTextLabel=false;
            this.blankAssist=false;
            this.commodityStyle=false;
        },
        // 获取子组件的默认背景色
        getData(data,item){
            if(item == '地址'){
                this.elementSendStyle = data
            }else if(item == '电话'){
                this.elementSendPhoneStyle = data
            }else if(item == '新闻资讯'){
                console.log(data)
                this.elementNewStyle = data
            }else if(item == '图片'){
                console.log(data)
                this.pictureStyles = data
            }else if(item == '文本'){
                this.TextBackgroundColor = data
            }else if(item == '辅助线'){
                this.sublineBackgroundColor = data
            }else if(item == '空白辅助'){
                console.log(data)
                this.blankAssistBackgroundColor = data
            }else if(item == '图文广告'){
                console.log(data)
                this.imageTextBackgroundColor = data
            }else if(item == '标题'){
                console.log(data)
                this.titleBackgroundColor = data
            }else if(item == '营销活动'){
                console.log(data)
                this.marketgroundColor = data
            }

            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    // console.log(this.list2[i])
                    return true;
                }
            }
        },
        // 获取单个背景颜色
        onebackgroundColor(data,item){
            if(item ==='图文广告'){
                this.imageTextOnebackgroundColor = data
            }
        },
        // 获取选择模板
        changeTemplate(data,item){
            if(item ==='图文广告'){
                this.imageTextchangeTemplate = data
            }else if(item ==='营销活动'){
                // console.log(data)
                if(data==4||data==5||data==6||data==7||data==8){
                    this.marketPadding = 0
                }
                this.marketingCampaignchangeTemplate = data
            }
        },
        // 图文内容
        titleInput(data,item){
            if(item ==='图文广告'){
                console.log(data)
                // console.log(data)
            }
        },
        // 子组件的字体大小
        radio(data,item){
            if(item == '文本'){
                if(data == 1){
                    // console.log(111)
                    this.TextRadio = 24
                }else if(data == 2){
                    this.TextRadio = 18
                }else{
                    this.TextRadio = 12
                }
                
            }
        },
        // 子组件的显示位置
        sideRadio(data,item){
            if(item == '文本'){
                if(data == 2){
                    this.TextsideRadio = 'center'
                }else if( data == 3){
                    this.TextsideRadio = 'right'
                }else{
                    this.TextsideRadio = 'left'
                }
                
            }else if(item == '标题'){
                if(data == 2){
                    this.titlesideRadio = 'center'
                }else if( data == 3){
                    this.titlesideRadio = 'right'
                }else{
                    this.titlesideRadio = 'left'
                }
            }
        },
        // 文本的内容
        textarea(data,item){
            if(item == '文本'){
                this.TextTextarea = data
            }else if(item == '标题'){
                this.titleStyleText = data
            }
        },
        // 副标题的内容
        subheadtextarea(data,item){
            if(item == '标题'){
                console.log(data)
                this.subheadtextareaText = data
            }
        },
        //子组件的字体颜色
        fontColor(data,item){
            if(item == '文本'){
                // console.log(data)
                this.TextFontColor = data
            }else if(item == '标题'){
                console.log(data)
                this.titleFontColor = data
            }
        },
        // 子组件的字体是否加粗
        strong(data,item){
            if(item == '文本'){
                if(data == true){
                    this.TextStrong = 'bold'
                }else{
                    this.TextStrong = '100'
                }
            }
        },
        // 获取子组件传的标题颜色
        setTitleColor(data,item){
            // console.log(data,item)
            if(item == '地址'){
                this.elementTitleColorStyle = data
            }else if(item == '电话'){
                this.elementSendPhoneTitleColorStyle = data
            }else if(item == '图文广告'){
                this.imageTextTitleColor = data
            }
            // this.elementTitleColorStyle = data
            // this.elementSendPhoneTitleColorStyle = data
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    // console.log(this.list2[i])
                    return true;
                }
            }          
        },
        // 获取子组件的价格颜色
        setPriceColor(data,item){
            if(item == '图文广告'){
                this.imageTextPriceColor = data
            }
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    // console.log(this.list2[i])
                    return true;
                }
            }          
        }, 
        // 获取子组件的位置颜色
        setsitesColor(data,item){
            // this.elementColorStyle = data
            if(item == '地址'){
                this.elementColorStyle = data
            }else if(item == '电话'){
                this.elementSendPhoneColorStyle = data
            }
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    return true;
                }
            }
        },
        phoneColor(data,item){
            if(item == '地址'){
                this.elementColorStyle = data
            }else if(item == '电话'){
                this.elementSendPhoneColorStyle = data
            }
            // this.elementColorStyle = data
            // this.elementSendPhoneColorStyle = data
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    return true;
                }
            }
        },
        // 获取子组件的圆角变化
        radius(data,item){
            // console.log(data,item)
            if(item == '地址'){
                this.elementRadius = data
            }else if(item == '电话'){
                this.elementSendPhoneRadius = data
            }else if(item == '图片'){
                this.pictureSendPhoneRadius = data
            }else if(item == '文本'){
                this.TextRadius = data
            }else if(item == '标题'){
                this.titleRadius = data
            }else if(item == '营销活动'){
                this.marketgroundRadio = data
            }
            else if(item == '图文广告'){
                this.imageTextRadius = data
            }
            else if(item == '空白辅助'){
                this.currentValueHeigthRadius = data
            }
            // this.elementRadius = data
            // this.elementSendPhoneRadius = data
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    return true;
                }
            }
        },
        // 内外边距监听
        margin(data,item){
            if(item == '地址'){
                this.elementMargin = data
            }else if(item == '电话'){
                this.elementSendPhoneMargin = data
            }else if(item == '图片'){
                this.pictureSendPhoneMargin = data
            }else if(item == '文本'){
                this.TextMargin = data
            }else if(item == '标题'){
                this.titleMargin = data
            }else if(item == '图文广告'){
                // console.log(data)
                this.imageTextMargin = data
            }else if(item == '营销活动'){
                this.marketMargin = data
            }
            // this.elementMargin= data
            // this.elementSendPhoneMargin= data
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    return true;
                }
            }
        },
        padding(data,item){
            if(item == '地址'){
                this.elementPadding = data
            }else if(item == '电话'){
                this.elementSendPhonePadding = data
            }else if(item == '图片'){
                this.pictureSendPhonePadding = data
            }else if(item == '文本'){
                this.TextPadding = data
            }else if(item == '辅助线'){
                this.sublinePadding = data
            }else if(item == '标题'){
                this.titlePadding = data
            }else if(item == '图文广告'){
                console.log(data)
                this.imageTextPadding = data
            }else if(item == '营销活动'){
                this.marketPadding = data
            }
            // this.elementPadding = data
            // this.elementSendPhonePadding = data
            for(let i=0;i<this.list2.length;i++){
                if(this.list2[i].name == item){
                    return true;
                }
            }
        },
        // 辅助线的颜色
        colors(data,item){
            if(item =='辅助线'){
                // console.log(data)
                this.sublineColor = data
            }
        },
        // 图片间距
        spaceBetweenRadius(data,item){
            if(item =='营销活动'){
                // console.log(data)
                this.marketspaceBetweenRadius = data       
            }
        },
        // 图片宽度
        wideRadius(data,item){
            if(item =='营销活动'){
                // console.log(data)
                this.marketwideRadius = data       
            }
        },
        // 背景圆角
        backgroundRadius(data,item){
            if(item === '图文广告'){
                // console.log(data)
                this.imageTextBackgroungRadius = data
            }
        },
        // 单个图片的圆角
        oneRadius(data,item){
            if(item =='营销活动'){
                // console.log(data)
                this.marketOneRadius = data       
            }else if(item =='图文广告'){
                // console.log(data)
                this.imageTextOneRadius = data
            }
        },
        // 辅助线的粗细
        thickness(data,item){
            if(item =='辅助线'){
                this.sublineThickness = data
            }
        },
        // 辅助线的样式（虚实线）
        styleRadio(data,item){
            if(item =='辅助线'){
                console.log(data)
                if(data == 1){
                    this.sublineStyleRadio = 'solid'
                }else{
                    this.sublineStyleRadio = 'dashed'
                    console.log(this.sublineStyleRadio)
                }
            }       
        },
    },
    watch:{
        // 监听默认背景颜色改变事件
        color(){
            // console.log(this.$refs.defultBackgroundColor)
            // this.defultBackgroundColor = this.$refs.defultBackgroundColor.color.value
            this.defultBackgroundColor = this.color
        },
    },
  }
</script>
<style scoped lang="less">
    .demo01{
        display: flex;
        height: 100%;
        text-align: center;
        .top{
            font-size: 30px;
            color: rgb(90, 136, 235);
        }
        .left{
            width: 20%;
            height: 100%;
            overflow: auto;
            background-color: #fff;
            .text-wrapper{
                padding-top:20px;
                .element{
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: space-around;
                    .item{
                        cursor: pointer;
                        width: 40%;
                        height: 60px;
                        line-height: 60px;
                        border: 1px dashed #eee;
                        overflow: hidden;
                    }
                    
                }
            }
        }
        .center{
            flex: 1;
            height: 100%;        
            // background-color: #ccc;
            .showElement{
                // width: 45%;
                width: 350px;
                height: 70%;
                margin: 0 auto;
                border: 1px solid #fff;
                // overflow: auto;
                .showElementTop{
                    display: flex;
                    justify-content: flex-end;
                    border: 1px solid #fff;
                    height: 6%;
                    padding: 1% 4% 1%;
                    .title{
                        flex: 1;
                        padding-left: 18%;
                        margin-top: 1.5%;
                    }
                    .set{
                        width: 20%;
                        height: 100%;
                        background: url('../../assets/imgs/setdraggable.png')  no-repeat;
                        background-size: 100%;
                        margin-top: 0 auto;
                    }
                }
                .showElementCenter{
                    width: 100%;    
                    .item{
                        cursor: pointer;
                        border: 1px solid rgb(90, 136, 235);
                        min-height: 18px;
                        display: flex;
                        justify-content: flex-end;
                        .items{
                            width: 100%;
                            min-height: 18px;
                        }
                        .del{
                            width: 18px;
                            // height: 20px;
                            background: url('../../assets/imgs/del.png')  no-repeat;
                            background-size: 100%;
                            display: none;
                            top: 0;
                            right: -10px;
                        }
                        .names{
                            display: flex;
                            justify-content: center;
                        }
                    }
                    .item:hover{
                        border: 1px dashed rgb(90, 136, 235);
                        height: auto;
                        .del{
                            display: inline;
                        }
                    }
                }
            }
        }
        .right{
            width: 40%;
            .titleName{
                height: 40px;
                line-height: 40px;       
                font-size: 20px;   
                color: #666;
            }
            .redact{
                background-color: #eee; 
            }
            .title,.background,.full-screen,.background-img{
                margin-top: 5px;
                display: flex;
                justify-content: flex-start;
                div{
                    width: 90px;
                    line-height: 40px;
                }
                .el-input{
                    width: 80%;
                }
                .set-full-screen{
                    cursor: pointer;
                    width: 30%;
                    display: flex;
                    .el-switch{
                        margin-top: 10px;
                        margin-left: 20px;
                        width: 50px;
                    }
                    div{
                        width: 100px;
                    }
                }
            }
            .background{
                .btn{
                    height: 40px;
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    color: #2692ff;
                    .m-colorPicker{
                        height: 40px;
                        padding: 12px 0;
                        .colorBtn{
                            width: 40px;
                            height: 40px;
                        }
                    }
                    .reset{
                        width: 30%;
                        cursor: pointer;
                    }
                }
            }
            .background-img{ 
                // margin-top: 50%;
                .backgroundImgsText{
                    line-height: 196px;
                }
                .backgroundImgs{
                    cursor: pointer;
                    margin: 0 atut;
                    margin-top: 50px;
                    width: 100px;
                    height: 100px;
                    background-color: #eee;
                    font-size: 40px;
                    font-weight: 400;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    text-align: center;
                    display: flex;
                    -webkit-box-pack: center;
                    justify-content: center;
                    -webkit-box-align: center;
                    align-items: center;
                }
            }
        }
        .imgsList{ 
            display: flex;
            flex-direction: row ;
            .imgsListTab{
                display: flex;
                width: 140px;
                height: 500px;
                flex-direction:column;
                text-align: center;
                .groupingList{
                    height: 100%;
                    button{
                        margin-top: 20px;
                        width: 120px;
                    }
                    .allGrouping{
                        margin-left: 10px;
                    }
                }
               
                .addGrouping{
                    margin-right: 5px;
                    margin-left: 20px;
                    margin-top: 10px;
                }
            }
        }
        .footer {
            display: flex;
            justify-content: center;
        }
    }
</style>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  /* // 滚动条位置 */
/* .__bar-is-vertical {
  right: -10px !important;
} */
/* // 隐藏横向滚动条 */
.__bar-is-horizontal {
  display: none !important;
}
</style>