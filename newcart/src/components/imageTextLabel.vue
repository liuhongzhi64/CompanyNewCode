<template>
  <div class="imageTextLabel">
    <div class="imageTextLabelTop">图文导航</div>
    <!-- <div class="tabWay">导航方式</div> -->
    <div class="setTemplate">
      <div class="template">导航方式</div>
      <div class="bolck">
        <div
          class="one"
          @click="changeTemplate(1)"
          :style="{'border': (changeTemplateImg1 ? '1px dashed rgb(90, 136, 235)' : '1px solid #fff')}"
        >
          <img src="../assets/imgs/imageTextLabelOne.png" alt />
        </div>
        <div
          class="one"
          @click="changeTemplate(2)"
          :style="{'border': (changeTemplateImg2 ? '1px dashed rgb(90, 136, 235)' : '1px solid #fff')}"
        >
          <img src="../assets/imgs/imageTextLabelTwo.png" alt />
        </div>
      </div>
    </div>
    <!-- 基本设置 -->
    <div class="basicSet">基本设置</div>
    <!-- 滑动设置 -->
    <div class="background">
      <div>滑动设置:</div>
      <div class="btn">
        <el-radio v-model="radio" label="1" style="line-height: 40px">固定</el-radio>
        <el-radio v-model="radio" label="2" style="line-height: 40px">横向滑动</el-radio>
      </div>
    </div>
    <!-- 背景色 -->
    <div class="background">
      <div>背景色:</div>
      <div class="btn">
        <el-color-picker v-model="backgroundColor"></el-color-picker>
        <div class="reset" @click="resetBackgroundColor">重置</div>
      </div>
    </div>
    <!-- 字体颜色 -->
    <div class="background">
      <div>字体颜色:</div>
      <div class="btn">
        <el-color-picker v-model="textColors"></el-color-picker>
        <div class="reset" @click="resetTextColor">重置</div>
      </div>
    </div>
    <!-- 圆角设置 -->
    <div class="setRadius">
      <div class="radius">圆角设置：</div>
      <div class="block">
        <el-slider v-model="radius" show-input :max="100"></el-slider>
      </div>
    </div>
    <!-- 外边距 -->
    <div class="setMargin">
      <div class="margin">外边距：</div>
      <div class="block">
        <el-slider v-model="margin" show-input :max="100"></el-slider>
      </div>
    </div>
    <!-- 内边距 -->
    <div class="setPadding">
      <div class="padding">内边距：</div>
      <div class="block">
        <el-slider v-model="padding" show-input :max="80"></el-slider>
      </div>
    </div>
    <!-- 一屏显示 -->
    <div class="imageTextCentent">
      <div>一屏显示</div>
      <div class="select">
        <el-select v-model="value">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </div>
    <!-- 图文内容1 -->
    <div class="setImageTextCentent" v-if="changeTemplateImg1">
      <div class="pictureList">
        <!-- 上传图片 -->
        <div class="uploading" @click="addPicture(1)">
          <div>+添加商品标签</div>
        </div>
        <div class="pictureItem" v-for="(i,k) in pictureItemLists" :key="k">
          <div class="uploadingImg">
            <div class="backgroundImgs" @click="centerDialogVisible = true">
              <i class="el-icon-plus"></i>
            </div>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt />
            </el-dialog>
          </div>
          <div class="links">
            <!-- <span @click="dialogLIink = true">编辑内容</span> -->
            <div class="setCenter">
              <div class="title">
                <span>标题：</span>
                <el-input placeholder="请输入内容" v-model="i.titleInput" clearable></el-input>
              </div>
              <div class="setCenter">链接： <el-button type="info" @click="dialogNewLIink(i)">编辑内容</el-button> </div>
            </div>
          </div>
          <div class="del" @click="delElement(i)"></div>
        </div>
        <!-- 链接的对话框 -->
        <el-dialog title="选择链接" :visible.sync="dialogLIink" v-if="dialogLIink" width="70%" center>
          <!-- 中间主体部分 -->
          <Link ref="newOrderDetail" />
          <!-- 页脚 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogLIink = false">取 消</el-button>
            <el-button type="primary" @click="dialogLIink = false">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 图片 -->
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
    </div>
    <!-- 图文内容2 -->
    <div class="setImageTextCentent" v-if="changeTemplateImg2">
      <div class="pictureList">
        <!-- 上传图片 -->
        <div class="uploading" @click="addPicture(1)">
          <div>+添加商品标签</div>
        </div>
        <div class="pictureItems" v-for="(i,k) in pictureItemLists" :key="k">
          <div class="links">
            <!-- <span @click="dialogLIink = true">编辑内容</span> -->
            <div class="setCenters">
              <div class="title">
                <span>标题：</span>
                <el-input placeholder="请输入内容" v-model="i.titleInput" clearable></el-input>
              </div>
              <div class="setCenter">链接： <el-button type="info" @click="dialogNewLIink(i)">编辑内容</el-button> </div>
            </div>
          </div>
          <div class="del" @click="delElement(i)"></div>
        </div>
        <!-- 链接的对话框 -->
        <el-dialog title="选择链接" :visible.sync="dialogLIink" v-if="dialogLIink" width="70%" center>
          <!-- 中间主体部分 -->
          <Link ref="newOrderDetail" />
          <!-- 页脚 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogLIink = false">取 消</el-button>
            <el-button type="primary" @click="dialogLIink = false">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import Link from "../components/link";
import mapDepot from "../components/mapDepot";
export default {
  components: { Link, mapDepot },
  data() {
    return {
      changeTemplateImg1: true, //选择样式
      changeTemplateImg2: false, //选择样式
      backgroundColor: "", //背景色
      radius: 0, //图片圆角设置
      margin: 0, //外边距
      padding: 0, //内边距
      textColors: "#000", //字体颜色
      radio: "2", //滑动方式
      dialogImageUrl: "",
      dialogVisible: false,
      dialogLIink: false,
      pictureItemLists: [
        {num:1,titleInput:''},
        {num:2,titleInput:''},
        {num:3,titleInput:''},
        {num:4,titleInput:''},
        {num:5,titleInput:''},
      ],
      num:5,
      centerDialogVisible: false, //上传图片
      options: [
        {
          value: "1",
          label: "5个导航"
        },
        {
          value: "2",
          label: "4个导航"
        },
        {
          value: "3",
          label: "3个导航"
        },
        {
          value: "4",
          label: "2个导航"
        },
        {
          value: "5",
          label: "1个导航"
        }
      ],
      value: "1"
    };
  },
  methods: {
    // 选择模板
    changeTemplate(i) {
      if (i == 1) {
        this.changeTemplateImg1 = true;
        this.changeTemplateImg2 = false;
      } else {
        this.changeTemplateImg1 = false;
        this.changeTemplateImg2 = true;
      }
    },
    // 点击重置背景颜色
    resetBackgroundColor() {
      this.backgroundColor = "";
    },
    resetTextColor() {
      this.textColors = "#000";
    },
    // 编辑内容（链接）
    dialogNewLIink(e) {
      this.dialogLIink = true;
      console.log(e);
    },
    // 点击删除
    delElement(item) {
      for (let i = 0; i < this.pictureItemLists.length; i++) {
        if (this.pictureItemLists[i] == item) {
          // console.log(i)
          this.pictureItemLists.splice(i, 1);
          return;
        }
      }
    },
    // 点击添加图片
    addPicture(i) {
      this.num = this.num + i;
      // console.log(i,this.num)
      this.pictureItemLists.push({num:this.num,titleInput:''});
    }
  },
  watch: {
    // 监听默认地址背景颜色改变事件
    backgroundColor() {
      this.$emit("getData", this.backgroundColor, "图文导航");
    },
    // 商品背景色
    textColors() {
      this.$emit("textColors", this.textColors, "图文导航");
    },
    // 单个圆角
    radius() {
      this.$emit("oneRadius", this.oneRadius, "图文导航");
    },
    // 监听外边距
    margin() {
      this.$emit("margin", this.margin, "图文导航");
    },
    // 监听内边距
    padding() {
      this.$emit("padding", this.padding, "图文导航");
    }
  }
};
</script>

<style lang="less" scoped>
.imageTextLabel {
  height: 880px;
  overflow-y: auto;
  .imageTextLabelTop,
  .basicSet,
  .template {
    background-color: #eee;
    margin-top: 5px;
  }
  .setTemplate {
    .template {
      background-color: #eee;
      margin-bottom: 10px
    }
    .bolck {
      display: flex;
      justify-content: space-around;
      .one {
        cursor: pointer;
        padding: 5px;
      }
      .one:hover {
        background-color: #eee;
      }
    }
  }
  .background {
    margin: 5px 0;
    display: flex;
    justify-content: flex-start;
    div {
      width: 100px;
      line-height: 40px;
    }
    .el-input {
      width: 80%;
    }
    .btn {
      height: 40px;
      display: flex;
      justify-content: center;
      width: 100%;
      color: #2692ff;
      .m-colorPicker {
        height: 40px;
        padding: 12px 0;
        .colorBtn {
          width: 40px;
          height: 40px;
        }
      }
      .reset {
        width: 30%;
        cursor: pointer;
      }
    }
  }
  .setRadius,
  .setMargin,
  .setPadding,
  .setRadius {
    .template,
    .radius,
    .margin,
    .padding {
      background-color: #eee;
    }
    .block {
      padding: 5px 100px;
      z-index: 1;
    }
  }
  .imageTextCentent {
    background-color: #eee;
    display: flex;
    justify-content: space-around;
    line-height: 40px;
  }
  .setImageTextCentent {
    .pictureList {
      padding: 0 10px;
    //   height: 240px;
      // overflow-y: auto;
      .pictureItem {
        position: relative;
        border: 1px solid #e9ebee;
        display: flex;
        padding: 10px;
        margin-top: 10px;
        .uploadingImg {
          width: 30%;
          .backgroundImgs {
            cursor: pointer;
            margin: 0 atut;
            margin-top: 10px;
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
        .links {
          display: flex;
          justify-content: center;
          // line-height: 148px;
          flex-direction: column;
          color: #31708f;
          .title {
            display: flex;
            margin: 15px 0;
            span {
              width: 30%;
              line-height: 40px;
            }
          }
          span {
            cursor: pointer;
          }
        }
      }
      .pictureItems {
        position: relative;
        border: 1px solid #e9ebee;
        // display: flex;
        padding: 5px;
        // margin-top: 10px;
        .links {
          display: flex;   
          color: #31708f;
          .setCenters{
              width: 100%;
              display: flex;
            justify-content: space-between;
            .setCenter{
                width: 40%;
                line-height: 70px;
            }
          }
          .title {
              width: 60%;
            display: flex;
            margin: 15px 0;
            span {
              width: 30%;
              line-height: 40px;
            }
          }
          span {
            cursor: pointer;
          }
        }
      }
      .pictureItem,.pictureItems:hover {
        border: 1px solid rgb(90, 136, 235);
        .del {
          display: block;
        }
      }
      .del {
        cursor: pointer;
        background: url("../assets/imgs/del.png") no-repeat;
        background-size: 100%;
        width: 20px;
        height: 20px;
        border-radius: 20px;
        position: absolute;
        top: -10px;
        right: -10px;
        display: none;
      }
    }
    .uploading {
      cursor: pointer;
      div {
        height: 34px;
        line-height: 34px;
        border: 1px solid #e9ebee;
        align-items: center;
        margin-top: 10px;
        margin-bottom: 10px;
        color: rgb(90, 136, 235);
      }
    }
    .uploading div:hover {
      border: 1px solid rgb(90, 136, 235);
    }
    .footer {
      display: flex;
      justify-content: center;
    }
  }
}
</style>