function recv(type="scatter")
{
    console.log(type)
    if(type=="scatter")
    {
        $.getJSON(
            "/query?type=all_shops&sff="+score_filter_from+"&sft="+score_filter_to+"&pff="+price_filter_from+"&pft="+price_filter_to+"&cf="+clock_from+"&ct="+clock_to+"&tr="+pop_threshold+"&kw="+keyword,
            function(data)
            {
                option.series[0].data = []
                $.each(
                    data,function(idx,item)
                    {
                    //console.log(option.series[0].data,"sdkfj");
                        option.series[0].data.push( { name:item[1],value:[item[3][0],item[3][1]], poiid:item[0] } );
                    }
                );
                setOption();
                }
        )
    }
    if(type=="heatmap")
    {
        $.getJSON(
            "/query?type=all_shops&sff="+score_filter_from+"&sft="+score_filter_to+"&pff="+price_filter_from+"&pft="+price_filter_to+"&cf="+clock_from+"&ct="+clock_to+"&tr="+pop_threshold+"&kw="+keyword,
            function(data)
            {
                option.series[0].data = []
                $.each(
                    data,function(idx,item)
                    {
                    //console.log(option.series[0].data,"sdkfj");
                        option.series[0].data.push( [item[3][0],item[3][1],1] );
                    }
                );
                setOption();
                }
            )
    }
    
}

var first_run = true
function setOption()
{
    if(!first_run)
    {
        option.bmap = null
        option.visualMap = null
    }
    myChart.setOption(option);
    first_run = false
}

function switch_to_heat()
{
    $("#user_filter_view").css("display","none")
    $("#select_shops_analysis").attr("class","select")
    $("#select_users_analysis").attr("class","select")
    $("#select_shops_heat").attr("class","select select_selected")
    close_user_detail()
    option.series[0].type = "heatmap"
    current_type = "heatmap"
    recv("heatmap")
}

function switch_to_scatter()
{
    $("#user_filter_view").css("display","none")
    $("#select_shops_analysis").attr("class","select select_selected")
    $("#select_users_analysis").attr("class","select")
    $("#select_shops_heat").attr("class","select")
    close_user_detail()
    option.series[0].type = "scatter"
    current_type = "scatter"
    recv("scatter")
}

function switch_to_user()
{
    $("#user_filter_view").css("display","block")
    $("#select_shops_analysis").attr("class","select")
    $("#select_users_analysis").attr("class","select select_selected")
    $("#select_shops_heat").attr("class","select")
    option.series[0].type = "scatter"
    current_type = "user"
}

function meals_only()
{
    if(meals_flag==0)
    {
        meals_flag = 1;
        $("#meal_only").css("background-color","#da4453")
    }
    else{
        meals_flag = 0;
        $("#meal_only").css("background-color","#333")
    }
    click_on_shop({
        name:cname,
        poiid:cid
    })
}

function click_on_shop(data)
{
    console.log(data);
    cname = data['name']
    cid = data['poiid']
    show_shop_detail(cname,cid)
    wc_img = document.getElementById("wc_img")
    wc_img.setAttribute("src",'/wordcloud?id='+cid+"&seed="+Math.random()+"&type=shop&meal_only="+meals_flag )
    bring_view_2top('shop')
}

function bring_view_2top(t)
{
    if(t=="user")
    {
        $("#shop_detail_view_border").css("z-index",1)
        $("#user_detail_view_border").css("z-index",2)
    }
    else{
        $("#shop_detail_view_border").css("z-index",2)
        $("#user_detail_view_border").css("z-index",1)
    }
}

function show_user_detail(uid)
{
    $("#user_detail_view_border").css("right","100px")
    setTimeout(function(){
        bring_view_2top('user')
    },1)
    switch_to_user()
}

function show_shop_detail(name,poiid)
{
    $.getJSON(
        "/query?type=shop_detail&poiid="+poiid,
        function(data)
        {
            detail_view = document.getElementById("detail_view")

            $("#text_title").text(name);
            $("#text_sub").text("SID:"+poiid)

            if(parseFloat( data['avgScore'])<1e-6)
            {
                $("#stars_cutter").css("width",0)
                $("#score").text("无评分")
                $("#score").css("width",'140px')
            }else
            {
                $("#stars_cutter").css("width", ( parseFloat( data['avgScore'])/5 * 100 ) + 'px' )
                $("#score").text(data['avgScore'])
                $("#score").css("width",'50px')
            }
            $("#add_txt").text(data['address'])
            $("#tel_txt").text(data['phone'])
            $("#avgp").text("均价"+data['avgPrice']+"元")
            pie_option.series[0].data = [
                { value: data['stars'][0], name: '1星' },
                { value: data['stars'][1], name: '2星' },
                { value: data['stars'][2], name: '3星' },
                { value: data['stars'][3], name: '4星' },
                { value: data['stars'][4], name: '5星' }
            ]
            pieChart.setOption(pie_option);

            $("#comments_view").html("")
            console.log(data['comments'])
            data['comments'].forEach(
                function(e)
                {
                    if(e[1]=='0')
                    {
                        e[1] = '匿名用户'
                    }
                    new_node = $('<div class="info_box comment" onclick="show_user_detail(\''+e[1]+'\')">'+e[1]+':'+e[0]+'</div>')
                    $("#comments_view").append(new_node)
                }
            )
            
        }
    )

    $("#shop_detail_view_border").css("right","50px")
}
function close_shop_detail()
{
    $("#shop_detail_view_border").css("right","-550px")
}
function close_user_detail()
{
    $("#user_detail_view_border").css("right","-550px")
}
function user_input()
{
    kw = $("#ftxt").val()
    console.log(kw)
    $("#labels_container").append("<div class=\"label\" onclick=\"filter_kw('" + kw +"')\">"  +kw+ "</div>")
    filter_kw(kw)
}
function cancel_input()
{
    $("#uip_btn").css("background-color","dodgerblue")
    $("#uip_btn").text("OK")
    $("#uip_btn").attr("onclick","user_input()")
    $("#ftxt").val("")
    keyword = ""
    recv()
}
function filter_kw(kw)
{
    $("#uip_btn").css("background-color","red")
    $("#uip_btn").text("清除")
    $("#uip_btn").attr("onclick","cancel_input()")
    $("#ftxt").val(kw)
    keyword = kw
    recv()
}


$("#slider_score").ionRangeSlider({
    type: "double",
    min: 1,
    max: 5,
    from: 3.5,
    to: 5,
    step: 0.5,
    grid: true,
    onFinish: function(data)
    {
        console.log(data.from,data.to)
        score_filter_from = data.from
        score_filter_to = data.to
        recv(current_type)
    }
});

$("#slider_price").ionRangeSlider({
    type: "double",
    min: 5,
    max: 100,
    from: 10,
    to: 40,
    step: 1,
    grid: true,
    onFinish: function(data)
    {
        console.log(data.from,data.to)
        price_filter_from = data.from
        price_filter_to = data.to
        recv(current_type)
    }
});

$("#slider_clock").ionRangeSlider({
    type: "double",
    min: 1,
    max: 24,
    from: 6,
    to: 24,
    step: 1,
    grid: true,
    onFinish: function(data)
    {
        console.log(data.from,data.to)
        clock_from = data.from
        clock_to = data.to
        recv(current_type)
    }
});

$("#slider_threshold").ionRangeSlider({
    type: "double",
    min: 1,
    max: 100,
    from: 20,
    to: 100,
    hide_min_max: true,
    to_fixed: true,
    step: 1,
    grid: true,
    onFinish: function(data)
    {
        console.log(data.from,data.to)
        pop_threshold = data.from
        recv(current_type)
    }
});

var score_filter_from = 1
var score_filter_to = 5
var price_filter_from = 10
var price_filter_to = 40
var clock_from = 6
var clock_to = 24
var current_type = "scatter"
var pop_threshold = 20

var meals_flag = 0;
var cname = "test";
var cid = "0";
var cuid = "0"
var keyword = ""

var chartDom = document.getElementById('map_view');
var myChart = echarts.init(chartDom);
var option;

option = {
    title: {
        text: '',
        left: 'center'
      },
    bmap: {
        center: [104.741722, 31.46402],
        zoom: 12,
        roam: true,
        enableMapClick: false
    },
    visualMap: {
        show: false,
        top: 'top',
        min: 0,
        max: 20,
        seriesIndex: 0,
        calculable: true,
        inRange: {
          color: [ 'green', 'yellow', 'rgba(218, 68, 83, 0.8)'],
        },
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'bmap',
        itemStyle: {
            color: 'rgba(218, 68, 83, 0.8)',
        },
        large:true,
        data: [],
        symbolSize: 10,
        encode: {
            value: 2
        },
        label: {
            formatter: '{b}',
            position: 'right',
            show: false
        },
        emphasis: {
            label: {
            show: true
        },
      }
    }]
  };

switch_to_scatter()
myChart.on('click',  function(param) {
    click_on_shop(param.data)
});

var chartDom = document.getElementById('star_pie');
var pieChart = echarts.init(chartDom);

pie_option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '40',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '1星' },
          { value: 735, name: '2星' },
          { value: 580, name: '3星' },
          { value: 484, name: '4星' },
          { value: 1300, name: '5星' }
        ]
      }
    ]
  };
  pieChart.setOption(pie_option)