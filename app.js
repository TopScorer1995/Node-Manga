var express=require("express");
var session=require("express-session");
var mysql=require("mysql");
var memcached=require("connect-memcached")(session);
var bodyParser = require('body-parser');
var md5=require("md5");
var file_upload=require('multer');
var Jimp = require('jimp');
var fs=require('graceful-fs');
var moment=require("moment");
var helmet = require('helmet');
var socket =require("socket.io");
var sharedsession = require("express-socket.io-session");
var pathm = require('path');
var cookieParser = require('cookie-parser');
var Recaptcha = require('express-recaptcha').Recaptcha;
var nodemailer = require('nodemailer');
var shorte=require('shorte-st');
var sharp=require("sharp");
var cheerio=require("cheerio");
var si = require('systeminformation');
var unzipper=require('unzipper');
var compression = require('compression');


setInterval(function(){conn.query('SELECT 1');},5000);
process.on('uncaughtException', function (err) {console.error(err);console.log("Node NOT Exiting...");});

var username_pattern =/^[a-zA-Z][0-9a-zA-Z_.-]{5,25}$/;
var email_pattern =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var password_pattren =/^[a-zA-Z0-9.-_]{6,}$/
var website_pattren=/^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*/;
var app=express();
var io_server = require('http').createServer(app);
var io =socket(io_server);
var conn=mysql.createConnection({multipleStatements: true,host:"localhost",user:"ammaramame",password:"ammaramame",database:"manga"})
app.use(session({secret  : 'lkashdlsdaksdkajsdlsdnkahds',resave:true,saveUninitialized: false,unset: 'destroy',maxAge:604800000,store:new memcached({hosts:['127.0.0.1:11211']})}))
app.use(bodyParser.json());
var recaptcha = new Recaptcha('6LeU630UAAAAABT_1SkRqNrqWbNsKNkwr__dFo53','6LeU630UAAAAADGIX4c5myQjgvCue8VUEx1AIKy_',{'hl':'ar'});
io.use(sharedsession(session({secret  : 'lkashdlsdaksdkajsdlsdnkahds',resave:true,saveUninitialized: false,unset: 'destroy',maxAge:604800000,store:new memcached({hosts:['127.0.0.1:11211']})})));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.set("view engine","ejs");
app.use("/",express.static(__dirname+'/public'));
app.use("/chapters",express.static(__dirname+"/chapter_photos"));
app.use("/profiles",express.static(__dirname+"/profiles"));
var upload=file_upload({storage:file_upload.diskStorage({})});
app.use(cookieParser("ammaramame120"));
app.use(compression({level:9}))
io_server.listen(80);
let online_users = new Map();
let reading_chapters=new Array();



console.log(process.memoryUsage().rss / 1048576);


app.use(function(req, res, next)
{   
	
	var rights_date=((new Date()).getFullYear());
	conn.query("select count(id) as count from notifications where seen=0 and to_number="+(req.session.uid || 0)+";select count(id) as count from messages where m_to="+(req.session.uid || 0)+" and seen=0;select id from users where suspend=1 and id="+(req.session.uid || 0),function(err,data)
	{
		if(err) throw err;
		res.locals.data_array=data;
		res.locals.uid=req.session.uid || "none";
		res.locals.date=rights_date;
    if(req.session.uid && data[2].length>0){req.session.destroy();}
		next();
	})
})





io.on('connection', function(socket)
{   socket.on("comment_typing",function(info){;io.emit("comment_typing",info)})
  if(socket.handshake.session.uid)
  { 
     
            
            online_users.set(socket.handshake.session.uid,socket);
            conn.query("update users set last_login=CURRENT_TIMESTAMP() where id="+socket.handshake.session.uid)

        
     
     
  }
    

    socket.on("disconnect",function()
      {   
        if(socket.handshake.session && socket.handshake.session.uid)
          { 
            online_users.delete(socket.handshake.session.uid);
          }
      })


})

var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
  reading_chapters.push(socket.handshake.query.chapter_number)
  
   socket.on("disconnect",function()
   {
      var index = reading_chapters.indexOf(socket.handshake.query.chapter_number);
if (index > -1) {
  reading_chapters.splice(index, 1);
}
      
   })
});







app.get("/",index);
app.post("/profile_menu",recaptcha.middleware.render,profile_menu);
app.post("/signup",signup);
app.post("/signin",recaptcha.middleware.verify,signin);
app.post("/logout",logout);
app.post("/upload_profile",upload.single('profile_file'),upload_profile);
app.post("/notifcation_menu",render_notifcation_menu);
app.post("/ignore_all_notifications",ignore_all_notifications);
app.post("/delete_all_notifications",delete_all_notifications);
app.post("/read_notifications",read_notifications);
app.post("/last_relesase",last_relesase);
app.post("/search_data",search_data);
app.post("/attach_modal",attach_modal)
app.post("/series_form",upload.single('profile'),series_form);
app.post("/team_form",upload.single("profile"),team_form);
app.post("/chapter_form",upload.single("chapter"),chapter_form);
app.post("/report_modal",report_modal);
app.post("/report_confirm",report_confirm);
app.post("/edit_user_modal",edit_user_modal);
app.post("/user_edit_form",upload.single("profile"),user_edit_form);
app.post("/edit_team_modal",edit_team_modal)
app.post("/edit_team_form",upload.single("profile"),team_edit_form);
app.post("/agree",agree);
app.post("/team_member_options",team_member_options);
app.post("/edit_series_modal",edit_series_modal);
app.post("/edit_series_form",upload.single("profile"),edit_series_form);
app.post("/edit_chapter_modeal",edit_chapter_modeal)
app.post("/edit_chapter_form",edit_chapter_form)
app.post("/delete_chapter",delete_chapter)
app.get("/library",library);
app.get("/error",error_page)
app.post("/manga_filter_form",manga_filter_form);
app.get("/profile/:id",profile);
app.get("/team/:id",team);
app.post("/upload_team_wallpaper",upload.single("wallpaper"),upload_team_wallpaper);
app.post("/join_or_disjoin",join_or_disjoin)
app.get("/manga/:id",manga)
app.post("/get_chapters",get_chapters)
app.post("/upload_series_wallpaper",upload.single("wallpaper"),upload_series_wallpaper)
app.post("/like_manga",like_manga)
app.get("/reader/:id",reader)
app.get("/news",news)
app.get("/new/:id",new_page);
app.get("/read_notification/:id",read_notification)
app.post("/add_news",upload.single("wallpaper"),add_news);
app.post("/get_add_news_modal",get_add_news_modal)
app.post("/remove_news",remove_news)
app.get("/cpanel",cpanel);
app.post("/proccess_report",proccess_report)
app.post("/messages",messages)
app.post("/get_generals_messages",get_generals_messages);
app.post("/mark_all_messages_reader",mark_all_messages_reader);
app.post("/chat_box",chat_box)
app.post("/get_chat_box_message",get_chat_box_message);
app.post("/send_message",send_message);
app.post("/read_reaction",read_reaction);
app.post("/rank_reaction",rank_reaction);
app.post("/delete_series",delete_series);
app.post("/users_table",users_table);
app.post("/teams_table",teams_table);
app.post("/series_table",series_table);
app.post("/sessions_table",sessions_table);
app.post("/chapters_table",chapters_table);
app.post("/activity_table",activity_table);
app.post("/reports_table",reports_table);
app.post("/proccessed_report",proccessed_report);
app.post("/restore_chapter",restore_chapter);
app.post("/restore_series",restore_series);
app.post("/main_cpanel_board",main_cpanel_board);
app.post("/edit_chapter_photos",upload.array('new_files'),edit_chapter_photos);
app.post("/comment_system",comment_system);
app.post("/like_comment",like_comment);
app.post("/dislike_comment",dislike_comment);
app.post("/delete_comment",delete_comment);
app.post("/render_comments",render_comments);
app.post("/submit_comment",submit_comment)
app.post("/search_users",search_users);
app.post("/user_comments",user_comments);
app.post("/get_news_box",get_news_box);
app.post("/delete_user_comments",delete_user_comments);
app.post("/series_hint",series_hint);
app.post("/contact_modal",contact_modal);
app.post("/session_modal",session_modal);
app.post("/create_new_session",create_new_session);
app.post("/get_sessions",get_sessions);
app.post("/session_options_form",session_options_form);
app.post("/get_session_messages",get_session_messages);
app.post("/session_message",session_message);
app.post("/get_authors",get_authors);
app.get("/how_to_upload",how_to_upload);
app.get("/privacy",privacy);
app.get("/terms",terms);
app.get("/progress",progress);
app.post("/last_releases_page",last_releases_page);
app.get("*",error_page);


function index(req,resp)
{ 
  var unique_chapters=reading_chapters.unique();unique_chapters.push(0);
  
   var query="select * from news where deleted=0 order by add_date desc limit 10;";
   query+="select count(id) as chapters_count from chapters where deleted=0 and yearweek(`add_date`) = yearweek(curdate()) order by add_date desc;";
   query+="select * from series where deleted=0 order by add_date desc limit 12;";
   query+="select *,id from series where deleted=0 order by (select count(id) from reactions where manga_number=series.id and (reaction=1 or reaction=2)) desc limit 18;";
   query+="select classifecation from series;";
   query+="select *,id from series where deleted=0 order by (select count(id) from reactions where manga_number=series.id and reaction=7) desc,(select count(id) from comments where type='series' and comment_on=series.id) desc limit 18;"
   /**/query+="select series.*,series.id from series inner join chapters on series.id=chapters.series_number where series.deleted=0 and chapters.deleted=0 group by series.id order by sum(chapters.seen_number) desc limit 18;"
   query+="select *,id,(select series_author from series where id=chapters.series_number) as series_author,(select series_description from series where id=chapters.series_number) as series_description,(select team_name from teams where id=chapters.by_team) as team_name,(select id from series where id=chapters.series_number) as series_id,(select series_name from series where id=chapters.series_number) as series_name,(select series_profile from series where id=chapters.series_number) as series_profile from chapters where id in ("+unique_chapters+") and deleted=0 limit 5;"
   query+="select *,id,(select profile_photo from users where id=comments.by_member) as profile_photo,(select username from users where id=comments.by_member) as username from comments where deleted=0   order by add_date desc limit 5"
  conn.query(query,function(err,data)
{  console.log("heelow"); 
  if(err) throw err;
 
  data[0].forEach(function(one_news,index){data[0][index].wallpaper=get_photo_link("news-wallpaper",one_news.id);data[0][index].label=Buffer.from(one_news.label,'base64').toString('utf8')})
  data[2].forEach(function(one_series,index){if(one_series.series_profile==1){data[2][index].series_profile=get_photo_link('manga-profiles',one_series.id)}else{data[2][index].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
  data[5].forEach(function(one_series,index){if(one_series.series_profile==1){data[5][index].series_profile=get_photo_link('manga-profiles',one_series.id)}else{data[5][index].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
  data[6].forEach(function(one_series,index){if(one_series.series_profile==1){data[6][index].series_profile=get_photo_link('manga-profiles',one_series.id)}else{data[6][index].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
  data[3].forEach(function(one_series,index){if(one_series.series_profile==1){data[3][index].series_profile=get_photo_link('manga-profiles',one_series.id)}else{data[3][index].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
  data[7].forEach(function(one_chapter,index){if(one_chapter.series_profile==1){data[7][index].series_profile=get_photo_link('manga-profiles',one_chapter.series_id)}else{data[7][index].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
  data[8].forEach(function(row,index)
    {
      var link="";
      if(row.type=="new"){link="/new/"+row.comment_on};
      if(row.type=="series"){link="/manga/"+row.comment_on}
      if(row.type=="chapter"){link="/reader/"+row.comment_on}
      data[8][index].link=link;
      data[8][index].body=Buffer.from(data[8][index].body,'base64').toString('utf8');data[8][index].type=replace_comment_type(row.type);if(row.profile_photo==1){data[8][index].profile_photo=get_photo_link("menu-profile",row.by_member)}else{data[8][index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
  var hint_array=new Array();for(var i=0;i<data[4].length;i++){var one_row_class=data[4][i].classifecation.split(",").remove('الحياة المدرسية');hint_array=hint_array.concat(one_row_class);if(i==data[4].length-1){hint_array=hint_array.unique().remove("");}}
  resp.render("index",{data:data,hint_array:hint_array});

})
	
}

function last_releases_page(req,resp)
{ var index=(req.body.index-1)*18;
  query="select *,id,(select classifecation from series where id=chapters.series_number) as classifecation,(select series_description from series where id=chapters.series_number) as series_description,(select team_name from teams where id=chapters.by_team) as team_name,(select id from series where id=chapters.series_number) as series_id,(select series_name from series where id=chapters.series_number) as series_name,(select series_profile from series where id=chapters.series_number) as series_profile from chapters where deleted=0 and yearweek(`add_date`) = yearweek(curdate()) order by add_date desc limit "+index+",18;";
  conn.query(query,function(err,data)
  {
    if(err) throw err;
    data.forEach(function(one_chapter,index){if(one_chapter.series_profile==1){data[index].series_profile=get_photo_link('manga-profiles',one_chapter.series_id)}else{data[index].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
    resp.send(data)
  })
}
function progress(req,resp)
{
  var q=req.query.q;
  console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
  conn.query(q,function(err,data)
  {
    if(err) throw err;
    console.log(data);
  })
}


function get_authors(req,resp)
{
  var word=req.body.word.trim();
  conn.query("select series_author from series where series_author like ("+conn.escape('%'+word+'%')+") order by CASE WHEN series.series_author LIKE '"+word+"%' THEN 1 WHEN series.series_author LIKE '%"+word+"' THEN 3 ELSE 2 END limit 6",function(err,data)
  {
    if(err) throw err;
    resp.send(data);
  })
}


function  profile_menu(req,resp)
{
  
  if(!req.session.uid){resp.render("regsiter_login_modal",{captcha:resp.recaptcha});}
  else {

  	conn.query("select * from users where id="+req.session.uid,function(err,data){if(err) throw err;profile_pic="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(data[0].profile_photo==1)profile_pic=get_photo_link('menu-profile',req.session.uid);resp.render('profile_menu',{last_login:moment(data[0].last_login).format('h:mma DD-MM-YYYY'),username:data[0].username,rank:data[0].rank,my_profile:profile_pic,id:req.session.uid});})
  	
       }
}








function signup(req,resp)
{    
	 if(req.session.uid){resp.end();}
     var email=req.body.email.trim().toLowerCase();
     var username=req.body.username.trim().toLowerCase();
     var password=req.body.password.trim();
     var repassword=req.body.repassword.trim();
    
    if(username=="" || email=="" || password=="" || repassword==""){resp.end("أحد الحقول فارغة");}
    else{
   

	if(username_pattern.test(username))
	{
		if(email_pattern.test(email))
		{
			
			if(password_pattren.test(password))
			{
				if(password==repassword)
				{  
					
					
					conn.query("select id from users where username="+conn.escape(username)+" or email="+conn.escape(email),function (err,row){if(row.length>0){resp.end("إسم المستخدم أو البريد الإلكتروني موجود بالفعل");}else{
                        conn.query("insert into users (username,email,password) values("+conn.escape(username)+","+conn.escape(email)+","+conn.escape(md5(password))+")",function(err,data)
                        { 
                            if(err) throw err;
                            set_activity(7,data.insertId,data.insertId);
                            req.session.uid=data.insertId;req.session.username=username;
                            resp.end(data.insertId.toString());

                        });}})
				    
						    
				
				}else {resp.end("كلمات المرور غير متطابقة");}
			}else {resp.end("كلمة المرور يجب أن تكون 8 محارف على الأقل ويمكن أن تحوي المحارف الخاصية التالية .-_");}
		}else {resp.end("صيغة البريد الإلكتروني غير صحيحة");}
	}else {resp.end("إسم المستخدم يجب أن يبدأ بحرف وأن يكون 5 محارف على الأقل يمكن أن يحوي أرقام والمحارف الخاصية التالية .-_");}
        
    
        }
}



function signin(req,resp)
{   

	if (!req.recaptcha.error){
	var username=req.body.username.trim().toLowerCase();
    var password=req.body.password.trim();

    
	if(username =="" || password==""){resp.end("أحد الحقول فارغة");return}
	else{
		

		password=md5(password);
	    conn.query("select * from users where (username="+conn.escape(username)+" or email="+conn.escape(username)+") and password="+conn.escape(password),function(err,row)
	    	{    
	    		if(err) throw err;
	    		
                        
                            if(row.length==1)
                            {
                               if(row[0].suspend==0)
                               {

                            	req.session.uid=row[0].id;req.session.username=row[0].username;resp.end("1")

                               }

                            	else{resp.end("تم حظر هذا الحساب من قبل الإدارة بسبب "+row[0].suspend_reason);}

                            }
                            else{resp.end("إسم المستخدم أو كلمة المرور غير صحيحة");}

                        
	    				
	    			
	    	})
	     
	    }
	}else {resp.end("الرجاء إتمام فحص الروبوت")}

}








function logout(req,resp)
{
	req.session.destroy();
	resp.end("1");

}






function upload_profile(req,resp)
{   
    

	if (!req.file){resp.end();}
	else{
	if(req.file.size/1024/1024>5){resp.end()}else
	{
	
	var ext=req.file.originalname.split('.').pop();
	if(ext != "jpg" && ext != "png" && ext != "jpeg"){resp.end();}
	else {
     Jimp.read(req.file.path, (err, lenna) => {
    if (err) throw err;
    lenna
    .background(0xFFFFFFFF)
    .cover(120,120)
    .write(get_photo_link('menu-profile',req.session.uid,true))
    conn.query("update users set profile_photo=true where id="+req.session.uid,function(err){if(err) throw err;;resp.end("1")})
    
    })
	//
	}
	
	
	     
	     }
	}
}




function render_notifcation_menu(req,resp)
{
	if(req.session.uid)
	{
		conn.query("select count(id) as count from notifications where to_number="+req.session.uid+" and seen=0",function(err,data)
		{
			resp.render("notifications_menu",{count:data[0].count});
		})
		
	}else {resp.end()}
}



function ignore_all_notifications(req,resp){if(req.session.uid){conn.query("update notifications set seen=1 where to_number="+req.session.uid);resp.end("1")}else{resp.end()}}
function delete_all_notifications(req,resp){if(req.session.uid){conn.query("delete from notifications where to_number="+req.session.uid);resp.end("1")}else{resp.end()}}




function read_notifications(req,resp)
{   
    if(req.session.uid)
    {
    var result_array=new Array();

    var after=req.body.from;
    var to=req.session.uid;
    conn.query("select * from (select * from notifications where to_number="+to+" ORDER by id desc) as noti limit "+after+",3",function(err,noti_data)
    {   if(err) throw err;
        if(noti_data.length==0){resp.end('none');}
        else
        {   noti_data.forEach(function(row,index)
          {
            var object=new Object();
            var query=""
            if(noti_data[index].type=="chapter"){query="select *,id,(select series_profile from series where id=chapters.series_number) as series_profile,(select series_name from series where id=chapters.series_number) as series_name from chapters where id="+noti_data[index].link_id}else
            if(noti_data[index].type.split(",")[0]=="tag"){query="select * from users where id="+noti_data[index].link_id}
            if(noti_data[index].type.split(",")[0]=="session_response"){query="select * from users where id="+noti_data[index].type.split(",")[1]}
      
            conn.query(query,function(err,data)
            {  if(err) throw err;
               
               if(noti_data[index].type=="chapter"){;object.name=data[0].series_name;object.body=noti_data[index].notification_data;object.id=noti_data[index].id;object.seen=noti_data[index].seen;object.img="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(data[0].series_profile==1)object.img=get_photo_link("manga-profiles",data[0].series_number);object.when=noti_data[index].add_date;result_array.push(object);}
               if(noti_data[index].type.split(",")[0]=="tag"){object.name=data[0].username;object.body=noti_data[index].notification_data;object.id=noti_data[index].id;object.seen=noti_data[index].seen;object.img="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(data[0].profile_photo==1)object.img=get_photo_link("menu-profile",data[0].id);object.when=noti_data[index].add_date;result_array.push(object);}
               if(noti_data[index].type.split(",")[0]=="session_response"){object.name=data[0].username;object.body=noti_data[index].notification_data;object.id=noti_data[index].id;object.seen=noti_data[index].seen;object.img="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(data[0].profile_photo==1)object.img=get_photo_link("menu-profile",data[0].id);object.when=noti_data[index].add_date;result_array.push(object);}
               if(noti_data.length-1==index){resp.send(result_array);}

            })

          })
           
            

          
            

        }
    })
}else {resp.end();}
}








function series_form(req,resp)
{
    if(!req.session.uid){resp.end();}else
    {
        var name=req.body.series_name.trim();
        var arabic_manga_name=req.body.series_arabic_name.trim();
        var manga_other_name=req.body.series_other_names.trim();
        var manga_create_date=req.body.product_year.trim();
        var manga_type="مانغا"
        var manga_author=req.body.series_author.trim();
        var manga_painter=req.body.series_painter.trim();
        var manga_status='مستمرة';
        var manga_descripe=req.body.description.trim();
        var manga_classes=req.body.classes;


       
          if(name==""){resp.send("حقل إسم السلسلة فارغ");resp.end()}else
          {



            if(manga_create_date=="" || manga_create_date.length!=4 || isNaN(manga_create_date)){resp.end("حقل سنة الإصدار غير صحيح")}else
            {
                if(manga_type==""){resp.end("حقل نوع المانغا فارغ");}else
                {
                    if(manga_author==""){resp.end("حقل مؤلف المانغا فارغ");}else
                    {
                        if(manga_painter==""){resp.end("حقل راسم المانغا فارغ");}else
                        {
                            if(manga_status==""){resp.end("حقل حالة المانغا فارغ");}else
                            {
                                if(manga_descripe==""){resp.end("حقل الوصف فارغ");}else
                                {
                                    if(manga_classes.length==0){resp.end("الرجاء أختيار تصنيفات للمانغا");}else
                                    { 
                                       if(!req.file){resp.end()}else
                                       {  var ext=pathm.extname(req.file.originalname);
                                          if(ext != ".jpg" && ext != ".png" && ext != ".jpeg"){resp.end()}else
                                          {
                                           if(req.file.size/1024/1024>5){resp.end()}else
                                           {
                                          conn.query("INSERT INTO `series` (`source`,`series_name`, `series_arabic_name`, `series_other_names`, `series_product_date`, `series_author`, `series_painter`, `series_description`, `series_profile`, `add_by`, `add_date`, `checked`, `last_update_by`, `last_update_date`, `classifecation`,  `type`, `status_of_manga`) VALUES ('',"+conn.escape(name)+", "+conn.escape(arabic_manga_name)+", "+conn.escape(manga_other_name)+","+conn.escape(manga_create_date)+", "+conn.escape(manga_author)+", "+conn.escape(manga_painter)+", "+conn.escape(manga_descripe)+", '1', '"+req.session.uid+"', CURRENT_TIMESTAMP, '0', '"+req.session.uid+"', CURRENT_TIMESTAMP,"+conn.escape(manga_classes.remove("").join(","))+", "+conn.escape(manga_type)+","+conn.escape(manga_status)+")",function(err,data)
                                          {
                                            if(err) throw err;
                                            Jimp.read(req.file.path, (err, lenna) => 
                                            {
                                            if (err) throw err;
                                            lenna.background(0xFFFFFFFF).resize(280,Jimp.AUTO).write(get_photo_link("manga-profiles",data.insertId,true));
                                            set_activity(4,req.session.uid,data.insertId)
                                            resp.end("1");
                                            })               
                                            
                                            
                                          })

                                          }

                                          }
                                       }
                                    }
                                }
                            }
                        }
                    }
                }

               }
            }
        
   

            
        
        

    

    }

}



function last_relesase(req,resp)
{   var chapter_array=new Array();

  var query="select *,id,(select team_name from teams where id=chapters.by_team) as team_name,(select series_name from series where id=chapters.series_number) as series_name from chapters where deleted=0 order by add_date desc limit 1500"
  if(req.body.reading_now){var unqie_reading=reading_chapters.unique();unqie_reading.push(0);query="select *,id,(select team_name from teams where id=chapters.by_team) as team_name,(select series_name from series where id=chapters.series_number) as series_name from chapters where deleted=0 and id in ("+unqie_reading+") order by add_date desc limit 1500 "}
  conn.query(query,function(err,data)
  {
    if(err) throw err;
    resp.render("relaeses_modal",{data:data})
  })
	

}





function search_data(req,resp)
{
    var word=req.body.word.trim();
    if(word==""){resp.end("none");}else
    {

        var object=new Object();
        /*var query="select *,(select count(DISTINCT chapter_number) from chapters where chapters.series_number=series.id and chapters.deleted=0) as chapter_count,(select sum(seen_number) from chapters where chapters.series_number=series.id and chapters.deleted=0) as seen_number  from series where deleted=0 and series_name like ("+conn.escape("%"+word+"%")+") or english_name like ("+conn.escape("%"+word+"%")+") or series_arabic_name like("+conn.escape("%"+word+"%")+") order by seen_number desc,CASE WHEN series_name LIKE '"+word+"%' THEN 1 WHEN series_name LIKE '%"+word+"' THEN 3 ELSE 2 END limit 15;"
           query+="select *,(select count(id) from reactions where reactions.by_number=users.id) as reaction_count from users where username like ("+conn.escape("%"+word+"%")+") order by CASE WHEN username LIKE '"+word+"%' THEN 1 WHEN username LIKE '%"+word+"' THEN 3 ELSE 2 END limit 5;"
           query+="select *,(select count(id) from chapters where chapters.by_team=teams.id and chapters.deleted=0) as chapter_count from teams where team_name like ("+conn.escape("%"+word+"%")+") order by CASE WHEN team_name LIKE '"+word+"%' THEN 1 WHEN team_name LIKE '%"+word+"' THEN 3 ELSE 2 END limit 5"*/
          
          var query="select series.*,chapters.chapter_number as chapter_count,chapters.seen_number as seen_number from series left join (select series_number,count(id) as chapter_number,sum(seen_number) as seen_number from chapters where deleted=0 GROUP BY series_number) as chapters on chapters.series_number=series.id where  series.deleted=0 and series_name like ("+conn.escape("%"+word+"%")+") or series.english_name like ("+conn.escape("%"+word+"%")+") or series.series_arabic_name like("+conn.escape("%"+word+"%")+") group by chapters.series_number order by seen_number desc,CASE WHEN series.series_name LIKE '"+word+"%' THEN 1 WHEN series.series_name LIKE '%"+word+"' THEN 3 ELSE 2 END limit 15;"
           query+="select users.*,reactions.reaction_count as reaction_count from users left join (select by_number,count(id) as reaction_count from reactions GROUP BY by_number) as reactions on users.id=reactions.by_number where users.username like ("+conn.escape("%"+word+"%")+") group by reactions.by_number order by CASE WHEN users.username LIKE '"+word+"%' THEN 1 WHEN users.username LIKE '%"+word+"' THEN 3 ELSE 2 END limit 5;"
           query+="select teams.*,chapters.chapters_count as chapter_count from teams left join (select by_team,count(id) as chapters_count from  chapters where deleted=0 GROUP BY by_team) as chapters on chapters.by_team=teams.id where teams.team_name like ("+conn.escape("%"+word+"%")+") group by chapters.by_team order by CASE WHEN teams.team_name LIKE '"+word+"%' THEN 1 WHEN teams.team_name LIKE '%"+word+"' THEN 3 ELSE 2 END limit 5"


        conn.query(query,function(err,data)
        {   
            if(err) throw err;
            data[0].forEach(function(manga,index){if(manga.chapter_count==null){data[0][index].chapter_count=0};;var img="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(manga.series_profile==1){img=get_photo_link("manga-profiles",manga.id);}data[0][index].series_profile=img})
            data[1].forEach(function(user,index){data[1][index].password="you wish";if(user.reaction_count==null){data[1][index].reaction_count=0};var img="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(user.profile_photo==1){;;img=get_photo_link("menu-profile",user.id);}data[1][index].profile_photo=img;})
            data[2].forEach(function(team,index){if(team.chapter_count==null){data[2][index].chapter_count=0};var img="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(team.team_profile==1){img=get_photo_link("team-profile",team.id);};data[2][index].team_profile=img;})
            object.manga=data[0];
            object.users=data[1];
            object.teams=data[2];
            resp.send(object);
            resp.end();
            
        })

        

    }
}




function attach_modal(req,resp)
{   if(!req.session.uid){resp.end()}else
    
    {   

    	   var hint_array=new Array(); 
            conn.query("select classifecation from series;select * from teams where id in (select team_number from team_members where member_status=1 and member_id="+req.session.uid+");select id from users where rank='مدير' and id="+req.session.uid,function(err,data)
                {
                    if(err) throw err;
                    data[1].forEach(function(row,index){if(row.team_profile==1){data[1][index].team_profile=get_photo_link("team-profile",row.id)}else{data[1][index].team_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
                    for(var i=0;i<data[0].length;i++)
                    {
                        var one_row_class=data[0][i].classifecation.split(",");
                        hint_array=  hint_array.concat(one_row_class);
                        if(i==data[0].length-1)
                        	{
                        		hint_array=hint_array.unique().remove("");
                        		resp.render("attach_modal",{classes:hint_array,my_teams:data[1],admin:data[2]});
                        	}
                    }
                });
        
    	
    }
	
}






function team_form(req,resp)
{   var team_name=req.body.team_name.trim();
    var email=req.body.email.trim();
    var site=req.body.website.trim();
    var facebook_page=req.body.facebook.trim();
    var twitter_page=req.body.twitter.trim();;
    var descrpiton=req.body.description.trim();
    var shorte="";if(shorte=="")shorte=null
    var team_profile_file=req.file;
    var have_photo=0;if(team_profile_file){have_photo=1;}

   if(site!="" && website_pattren.test(site)==false){resp.end("صيغة الموقع غير صحيحة");}else
    {
   if(req.file){var ext=pathm.extname(req.file.originalname);}
     
    if(team_profile_file && ext != ".jpg" && ext != ".png" && ext != ".jpeg"){resp.end("");}else
    {
    if(team_profile_file && team_profile_file.size/1024/1024>5){resp.end("")}else
    {
    if(!req.session.uid){resp.end();}else
    {
    if(1==0){resp.end("البريد الإلكتروني فارغ أو غير صحيح");}else
    {
    if(team_name=="" || team_name==undefined || descrpiton=="" || descrpiton==undefined){resp.end("إسم الفريق أو الوصف فارغ");}else
    {
        conn.query("select id from teams where email="+conn.escape(email)+" or team_name="+conn.escape(team_name),function(err,data)
        {
            if(data.length>0){resp.end("إسم الفريق أو البريد الإكلتروني هذا موجود مسبقا");}else
            {
                conn.query("insert into teams (team_name,email,website,facebook_page,twitter_page,team_profile,team_creator,team_status,shorte_code) values('"+team_name+"','"+email+"','"+site+"','"+facebook_page+"','"+twitter_page+"',"+have_photo+","+req.session.uid+","+conn.escape(descrpiton)+","+conn.escape(shorte)+")",function(err,inserted_team)
                {  
                    if (err) throw err;
                    if(team_profile_file)
                    {
                         
                         Jimp.read(req.file.path, (err, lenna) => {
                         if (err) throw err;
                         lenna
                         .background(0xFFFFFFFF)
                         .cover(150,150) 
                         .quality(70)
                         .write(get_photo_link('team-profile',inserted_team.insertId,true));
                                
                        })
                        
                    }
                         
                         conn.query("insert into team_members (team_number,member_status,permission,member_id,type) values ("+inserted_team.insertId+",1,4,"+req.session.uid+",'قائد الفريق')");
                         resp.end("1");
                })
            }
        })
    }
    }
    }
    }
    }
    }//
    
}





function chapter_form(req,resp)
{
	var chapter=req.body.chapter_number.trim();
	var folder=req.body.folder_number.trim();
	var chapter_label=req.body.chapter_label.trim();
	var team =req.body.team.trim();
	var manga=req.body.manga.trim();
	zip_file=req.file;

	 if(!req.session.uid){resp.end();}else
    {
         if(manga=="" || chapter=="" || folder=="" ||  team==""){resp.end("بعض الحقول الضرورية فارغة");}else
        {
        	if(!zip_file){resp.end();}else
            {
            	if(isNaN(chapter) || isNaN(folder) || isNaN(manga) || isNaN(team)){resp.end("رقم الفصل والمجلد يحوي صيغة خاطئة");}else
                {

                	conn.query("select id,team_name from teams where id="+team+" and active=1 and suspend=0 and (id=(select team_number from team_members where member_id="+req.session.uid+" and member_status=1 and permission > 0 and team_number="+conn.escape(team)+") or (select id from users where id="+req.session.uid+" and rank='مدير')="+req.session.uid+");select id,series_name from series where id="+manga+";select * from users",function(err,data)
                    {   if(err) throw err;
                    	
                    	if(data[0].length==0 || data[1].length==0){resp.end("هذا الفريق لم تتم الموافقة عليه بعد أو أنك لست عضو في هذا الفريق أو أنه ليس لديك صلاحيات لرفع الفصول من قبل قائد الفريق")}   // check team and member
                    	else{
                               
                              var random=md5((Math.random() * 10000000)+""+new Date().getTime());
                              var stream=fs.createReadStream(zip_file.path)
                               .pipe(unzipper.Extract({ path: '/tmp/'+random }));
                               stream.on("close",function()
                               {
                                fs.readdir('/tmp/'+random, (err, files) => {
                                files.forEach(function(file,index){
                                 

                                
                                
                                var ext = file.match(/\.([^\.]+)$/)[1];
                                switch(ext)
                                 {
                                   
                                   case 'jpg':
                                   case 'jpeg':
                                   case 'png':
                                   case 'gif':
                                   if(index==files.length-1){var token=md5(Math.random() * 10000000);conn.query("INSERT INTO `chapters` (`token`,`series_number`,`by_team`, `chapter_status`, `folder`, `seen_number`, `chapter_label`,`chapter_number`) VALUES ('"+token+"',"+manga+","+team+", 0,"+folder+" , '0', '"+chapter_label+"',"+chapter+")",function(err,new_chapter){if(err) throw err;uploadchapter("/tmp/"+random,manga,team,new_chapter.insertId,token,function(){data[2].forEach(function(user){add_notifications('chapter',user.id,"تمت إضافة فصل رقم "+chapter+" لسلسلة "+data[1][0].series_name+" من قبل فريق "+data[0][0].team_name,new_chapter.insertId)});set_activity(1,req.session.uid,new_chapter.insertId);resp.end("1")})})}
                                   break;
                                   default:
                                   resp.end();
            
                                 }
                               


                                 ;;;
                              });
                                })
                               })
                             
                               
                            
                         

                    	}

                    })

                }

            }

        }
    }
	

}



function uploadchapter(zipfile,manga_id,team_id,chapter_id,token,callback)
{  
   if (!fs.existsSync(__dirname+"/chapter_photos/")){fs.mkdirSync(__dirname+"/chapter_photos/");}
   if (!fs.existsSync(__dirname+"/chapter_photos/"+manga_id)){fs.mkdirSync(__dirname+"/chapter_photos/"+manga_id);}
   if (!fs.existsSync(__dirname+"/chapter_photos/"+manga_id+"/"+team_id)){fs.mkdirSync(__dirname+"/chapter_photos/"+manga_id+"/"+team_id);}
   if (!fs.existsSync(__dirname+"/chapter_photos/"+manga_id+"/"+team_id+"/"+chapter_id)){fs.mkdirSync(__dirname+"/chapter_photos/"+manga_id+"/"+team_id+"/"+chapter_id);}
   fs.readdir(zipfile,function(err,files)
   {

    files.forEach(function(entry,index)
   {
       sharp(zipfile+"/"+entry).jpeg().toFile(__dirname+"/chapter_photos/"+manga_id+"/"+team_id+"/"+chapter_id+"/"+index+"-"+token+"-high.jpg",function(err,infi){if(err) throw err;})
       sharp(zipfile+"/"+entry).jpeg(80).toFile(__dirname+"/chapter_photos/"+manga_id+"/"+team_id+"/"+chapter_id+"/"+index+"-"+token+"-med.jpg",function(err,infi){if(err) throw err;})
         if(files.length-1==index)
         {
           
           callback()

         }
       
    })

   })
   

}



function report_modal(req,resp)
{
	if(!req.session.uid){resp.end("0");}else
	{
		if(!req.body.oid || !req.body.type){resp.end();}else
		{   var type=req.body.type;
			var id=req.body.oid;
            var col_of_name="",table_name=""
            var name_to_show=""
            if(type=="team"){col_of_name="team_name";table_name="teams";name_to_show="فريق"}else
            if(type=="chapter"){col_of_name="chapter_number";table_name="chapters";name_to_show="الفصل رقم"}else
            if(type=="series"){col_of_name="series_name";table_name="series";name_to_show="سلسلة"}
            conn.query("select "+col_of_name+" from "+table_name+" where id="+id,function(err,data){if(err) throw err;resp.render("report_modal",{oid:id,type:type,name_to_show:name_to_show,report_on_name:data[0][col_of_name]})})

		}
	}
}



function report_confirm(req,resp)
{

	var type=req.body.process_type.trim();
	var oid=req.body.oid.trim();
	var body=req.body.report_body.trim();
	var by=req.session.uid;
    if(type=="" || isNaN(oid) || !req.session.uid){resp.end()}else
    {
    	if(body==""){resp.end("رسالة التبليغ فارغة");}else
    	{
    		conn.query("insert into reports (by_member,body,type,report_on_id) values ("+by+","+conn.escape(body)+","+conn.escape(type)+","+oid+")",function(err,data){if(err) throw err;resp.end("1")})
    	}
    }


}




function edit_user_modal(req,resp)
{

 if(!req.session.uid || !req.body.uid){resp.end();}else
 {
 	conn.query("select * from users where id="+req.body.uid+";select rank from users where id="+req.session.uid,function(err,user)
 	{
 		if(err) throw err;
 		profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";if(user[0][0].profile_photo==1){profile=get_photo_link("menu-profile",req.body.uid);}
 		if(user[1][0].rank!="مدير" && user[0][0].id!=req.session.uid){resp.end()}else
 		{
 			if(req.session.uid==user[0][0].id){resp.render("edit_user_modal",{type:"my",profile:profile,user:user[0][0]})}else
 			if(user[1][0].rank=="مدير"){resp.render("edit_user_modal",{type:"admin",name:user[0][0].username,profile:profile,user:user[0][0]})}
 		}
 	})
 }

}





function user_edit_form(req,resp)
{
	
	if(!req.session.uid){resp.end()}else
	{       var username=req.body.username.trim();
		    var email=req.body.email.trim();
        var half_query="";
		    var block_reason=req.body.block_reason;
            var id=req.body.user_id.trim();
            var suspend=req.body.block;
            var rank=req.body.rank;
            var profile=req.file;
            var password=req.body.password.trim();
            conn.query("select id from users where (username="+conn.escape(username)+" or email="+conn.escape(email)+") and id <> "+id+";select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data){if(err) throw err;if(data[0].length==0)
            {


            
            if(suspend=="true" && block_reason==""){;resp.end("يجب ملئ حقل سبب الحظر");return}
            if(password!="" && !password_pattren.test(password)){resp.end("كلمة المرور يجب أن تكون 8 محارف على الأقل ويمكن أن تحوي المحارف الخاصية التالية .-_");return}
            if(password!="" && password_pattren.test(password)){password=",password="+conn.escape(md5(password));}
            if(!suspend){suspend=0}else if(suspend=="true" && data[1].length>0){suspend=1}else if(suspend=="false" && data[1].length>0){suspend=0}
            if(rank=="true" && data[1].length>0 && req.session.uid!=id){rank=",rank='مدير'"}else if(rank=="false" && data[1].length>0 && req.session.uid!=id){rank=",rank='مستخدم'"}else{rank=""}
            if(username=="" || email==""){resp.end("بعض الحقول الضرورية فارغة")}else 
            {
               if(!username_pattern.test(username)){resp.end("إسم المستخدم يجب أن يبدأ بحرف وأن يكون 5 محارف على الأقل يمكن أن يحوي أرقام والمحارف الخاصية التالية .-_")}else
               {
               	 if(!email_pattern.test(email)){resp.end("صيغة البريد الإلكتروني غير صحيحة")}else
               	 {

                       if (!req.file){}
	                   else{
	                   if(req.file.size/1024/1024>5){resp.end()}else
	                       {
	
	                         var ext=req.file.originalname.split('.').pop();
	                         if(ext != "jpg" && ext != "png" && ext != "jpeg"){resp.end();}
	                         else {
	                         	    
                                    Jimp.read(req.file.path, (err, lenna) => {
                                    if (err) throw err;
                                    lenna
                                    .background(0xFFFFFFFF)
                                    .cover(120,120)
                                    .write(get_photo_link('menu-profile',id,true))
                                    conn.query("update users set profile_photo=true where id="+id);
                                                                             })
	
	                               }
	
	
	     
	                        }
	                        }//
	                        if(suspend==1){half_query=",suspend_by="+req.session.uid;if(online_users.get(parseInt(id))){online_users.get(parseInt(id)).handshake.session.destroy()};emit_message_to_socket("reload","suspend",parseInt(id),req.session.username,req.session.uid);;}
	                        conn.query("update users set username="+conn.escape(username)+",email="+conn.escape(email)+",suspend_reason="+conn.escape(block_reason)+half_query+rank+",suspend="+conn.escape(suspend)+password+" where id="+id,function(err,data){if(err) throw err;set_activity(8,req.session.uid,id);resp.end("1")});

                     
               	 }
               }
            }

        }else{resp.end("إسم المستخدم أو البريد الإلكتروني محجوز مسبقا من قبل عضو أخر");}})
	}
}


function edit_team_modal(req,resp)
{
	if(!req.session.uid){resp.end()}else
	{   var team=req.body.uid;
		conn.query("select id,rank from users where (rank='مدير' and id="+req.session.uid+") or id=(select member_id from team_members where team_number="+team+" and member_status=1 and permission=4 and member_id="+req.session.uid+");select * from teams where id="+team+";select *,(select username from users where users.id=team_members.member_id) as name from team_members where team_number="+team,function(err,data)
		{   
			if(err) throw err;
			if(data[0].length==0){resp.end();}else
			{
                 if(data[1][0].team_profile==1){data[1][0].team_profile=get_photo_link("team-profile",team);}else {data[1][0].team_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}
                 resp.render("edit_team_modal",{team_info:data[1][0],this_user:data[0][0],team_members:data[2]});
			}

		})
		
	}
}





function team_edit_form(req,resp)
{
	
	if(!req.session.uid){resp.end()}else
	{
		var team=req.body.team.trim();
		var team_name=req.body.team_name.trim();
		var email=req.body.email.trim();
		var website=req.body.website.trim();
		var facebook=req.body.facebook.trim();
		var twitter=req.body.twitter.trim();
		var team_status=req.body.team_status.trim();
		var shorte_code="false"
		var is_banned=req.body.is_panned;
		var active_shorte=req.body.active_shorte;
		var suspend_reason=req.body.suspend_reason;
		conn.query("select id,rank from users where (rank='مدير' and id="+req.session.uid+") or id=(select member_id from team_members where team_number="+team+" and member_status=1 and permission=4 and member_id="+req.session.uid+")",function(err,this_user)
		{
			if(this_user[0].rank=="مستخدم"){is_banned="";suspend_reason="";active_shorte="";}else 
			if(this_user[0].rank=="مدير"){if(is_banned=="true"){is_banned=1;}else{is_banned=0};if(active_shorte=="true"){active_shorte=1}else{active_shorte=0}}
			if(1==0){resp.end("صيغة بريد إلكتروني غير صحيحة")}else
			if(website && !website_pattren.test(website)){resp.end("صيغة الموقع غير صحيحة")}else
			if(is_banned==1 && suspend_reason.trim()==""){resp.end("يجب ملئ سبب الحظر")}
			else
			    {   
			    	if(active_shorte!==""){active_shorte=",shorte_active="+active_shorte}
			    	if(is_banned!==""){is_banned=",suspend="+is_banned}
                    if(suspend_reason!==""){suspend_reason=",suspend_reason="+conn.escape(suspend_reason)}
			    	conn.query("update teams  set team_name="+conn.escape(team_name)+",email="+conn.escape(email)+",website="+conn.escape(website)+",facebook_page="+conn.escape(facebook)+",twitter_page="+conn.escape(twitter)+",team_status="+conn.escape(team_status)+",shorte_code="+conn.escape(shorte_code)+active_shorte+suspend_reason+is_banned+"  where id="+team,function(err,data)
			    	{    
			    		if(err) throw err;
			    		if (!req.file){}
	                   else{
	                   if(req.file.size/1024/1024>5){resp.end()}else
	                       {
	
	                         var ext=req.file.originalname.split('.').pop();
	                         if(ext != "jpg" && ext != "png" && ext != "jpeg"){resp.end();}
	                         else {
	                         	    
                                    Jimp.read(req.file.path, (err, lenna) => {
                                    if (err) throw err;
                                    lenna
                                    .background(0xFFFFFFFF)
                                    .cover(120,120)
                                    .write(get_photo_link('team-profile',team,true))
                                    conn.query("update teams set team_profile=true where id="+team);
                                                                             })
	
	                               }
	
	
	     
	                        }
	                        }//
                          set_activity(10,req.session.uid,team)
	                        resp.end("1");

			    	})
			    }
		})



	}
}


function agree(req,resp)
{
	if(!req.session.uid || !req.body.type || !req.body.oid){resp.end()}else
	{
		var type=req.body.type.trim();
		var oid=req.body.oid.trim();
		var query=""
		if(type=="chapters"){query="update chapters set chapter_status=1 where id="+oid}else
		if(type=="teams"){set_activity(9,req.session.uid,oid);query="update teams set active=1 where id="+oid}else
		if(type=="series"){query="update series set checked=1 where id="+oid}else
		if(type=="report"){query="update reports set proccessed=1 where id="+oid;}

	  conn.query("select id from users where rank='مدير' and id="+req.session.uid,function(err,user)
	  {
	  	if(err) throw err;
	  	if(user.length>0)
	  	{
            
            conn.query(query,function(err,data){if (err) throw err;resp.end("1")})

	  	}else{resp.end();}
	  })

	}
}







function team_member_options(req,resp)
{   

	if(!req.session.uid || !req.body.type || !req.body.id || (!req.body.value && req.body.type!="type")){resp.end();}else
	{  var half_query="";
	   var type=req.body.type
     if(type=="type" && req.body.value.trim().length > 19){resp.end("حجم البيانات أكبر من اللازم");}else
     {
	   if(type=="permission"){half_query="permission=";if(req.body.value=="true"){half_query=half_query+"4"}else{half_query=half_query+"1"}}else
	   if(type=="type"){half_query="type="+conn.escape(req.body.value.trim())}else
	   if(type=="accept"){half_query="member_status=1"}
       var query="update team_members set "+half_query+" where id="+req.body.id;
       if(type=="delete"){query="delete from team_members where id="+req.body.id;}

       conn.query("select id,rank,(select team_number from team_members where id="+req.body.id+") as team_number from users where (rank='مدير' and id="+req.session.uid+") or id=(select member_id from team_members where team_number=(select team_number from team_members where id="+req.body.id+") and member_status=1 and permission=4 and member_id="+req.session.uid+")",function(err,data)
       	{
       		if(err) throw err;
       		if(data.length>0)
       		{
       			conn.query(query,function(err,new_data)
                {
       	         if(err) throw err;
                 set_activity(10,req.session.uid,data[0].team_number)
       	         resp.end("1");
                })

       		}
       	})
     }
       
	}
}

function edit_series_modal(req,resp)
{
	var id=req.body.uid;
	if(!req.session.uid){resp.end()}else
	{
		conn.query("select * from series where (id="+conn.escape(id)+") and  (add_by="+req.session.uid+" or (select rank from users where id="+req.session.uid+")='مدير');select * from users where id="+req.session.uid+";select classifecation from series",function(err,data)
		{
			if(err) throw err;
			if(data[0].length>0)
			{
				if(data[0][0].series_profile==1){data[0][0].series_profile=get_photo_link("manga-profiles",data[0][0].id);}else{data[0][0].series_profile='https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg'}
                data[0][0].classifecation=data[0][0].classifecation.split(",");



                var hint_array=new Array();
                 for(var i=0;i<data[2].length;i++)
                    {
                        var one_row_class=data[2][i].classifecation.split(",");
                        hint_array=  hint_array.concat(one_row_class);
                        if(i==data[2].length-1)
                        	{
                        		hint_array=hint_array.unique().remove("");
                                resp.render("edit_series_modal",{series:data[0][0],this_user:data[1][0],classes:hint_array})
                        	}
                    }
              
			}
		})
	}
}




function edit_series_form(req,resp)
{
	if(!req.session.uid){resp.end()}else
	{  
		var id=req.body.id.trim();
        var series_name=req.body.series_name.trim();
        var series_other_names=req.body.series_other_names.trim();
        var series_arabic_name=req.body.series_arabic_name.trim();
        var english_name=req.body.english_name.trim();
        var series_product_date=req.body.series_product_date.trim();if(series_product_date.length!=4 || isNaN(series_product_date)){resp.end("حقل سنة الإصدار غير صحيح");return}
        var series_author=req.body.series_author.trim();
        var series_painter=req.body.series_painter.trim();
        var mal=req.body.mal;
        var sources="";if(req.body.sources){sources=req.body.sources.split(",");sources.remove("");sources=sources.join(",");}
        var age="";if(req.body.age){age=req.body.age.trim();}
        var type="مانغا"
        var status_of_manga=req.body.status_of_manga;
        var classifecation=req.body.classifecation.remove("").join(",")
        var series_description=req.body.series_description.trim();
        conn.query("select id,rank from users where id="+req.session.uid+" or id=(select add_by from series where id="+conn.escape(id)+")",function(err,data)
        {
        	if(err) throw err;
        	mal=",mal="+conn.escape(mal);
        	sources=",source="+conn.escape(sources);
        	if(age.length==0){age=0}


        	if(data.length>0)
        	{
                if(data[0].rank=="مستخدم"){mal="",sources="";status_of_manga=""}else{status_of_manga=", status_of_manga="+conn.escape(status_of_manga);}
                var query="update series set series_name="+conn.escape(series_name)+",series_arabic_name="+conn.escape(series_arabic_name)+",english_name="+conn.escape(english_name)+",series_other_names="+conn.escape(series_other_names)+",series_product_date="+conn.escape(series_product_date)+",series_author="+conn.escape(series_author)+",series_painter="+conn.escape(series_painter)+mal+",type="+conn.escape(type)+",age="+age+status_of_manga+",classifecation="+conn.escape(classifecation)+sources+",series_description="+conn.escape(series_description)+" where id="+id;
                conn.query(query,function(err,inserting)
                {
                	if(err) {resp.end("حدث خطا في التنفيذ");throw err;}
                	if (!req.file){}
	                   else{
	                   if(req.file.size/1024/1024>5){resp.end()}else
	                       {
	
	                         var ext=req.file.originalname.split('.').pop();
	                         if(ext != "jpg" && ext != "png" && ext != "jpeg"){resp.end();}
	                         else {
	                         	        sharp(req.file.path).jpeg(20).toFile(get_photo_link('manga-profiles',id,true),function(err,infi){if(err) throw err;conn.query("update series set series_profile=true where id="+id);})
                                    
	
	                               }
	
	
	     
	                        }
	                        }//
                  set_activity(5,req.session.uid,id)
                	resp.end("1");
                })
                
        	}

        })


	}
}


function edit_chapter_modeal(req,resp)
{ 
	if(!req.session.uid){resp.end()}else
	{
		 conn.query("select * from chapters where id="+conn.escape(req.body.uid)+" and (by_team=(select team_number from team_members where member_id="+req.session.uid+" and permission=4 and team_members.team_number=chapters.by_team) or (select rank from users where id="+req.session.uid+")='مدير');select rank from users where id="+req.session.uid,function(err,data)
		 {  if(err) throw err;
		 	if(data[0].length>0)
		 	{
         fs.readdir(__dirname+"/chapter_photos/"+data[0][0].series_number+"/"+data[0][0].by_team+"/"+data[0][0].id+"/",function(err,files)
        { 
          if(err) throw err;
          var res="high";
          var files_array=new Array();
          for(var i=0;i<(files.length/2);i++)
          {
              files_array.push("/chapters/"+data[0][0].series_number+"/"+data[0][0].by_team+"/"+data[0][0].id+"/"+i+"-"+data[0][0].token+"-"+res+".jpg")
              if((files.length/2)-1==i){resp.render("edit_chapter_modal",{chapter_info:data[0][0],this_user:data[1][0],photos_array:files_array});}
          }

        })
		 		
		 	}
		 })
		 
	}
  
}



function edit_chapter_form(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    var id=req.body.id.trim();
    var chapter_number=req.body.chapter_number.trim();
    var chapter_label=req.body.chapter_label.trim();
    var folder=req.body.chapter_folder.trim();
    var is_plus_17=req.body.is_plus_17;
    conn.query("select * from chapters where id="+conn.escape(id)+" and (by_team=(select team_number from team_members where member_id="+req.session.uid+" and permission=4 and team_members.team_number=chapters.by_team) or (select rank from users where id="+req.session.uid+")='مدير');select rank from users where id="+req.session.uid,function(err,data)
    {
      if(err) throw err;
      if(chapter_number=="" || folder==""){resp.end("بعض الحقول الضرورية فارغة");}else
      if(isNaN(chapter_number) || isNaN(folder)){resp.end("رقم المجلد والفصل يجب أن يكون رقم");}else
      {
      if(data[0].length>0)
      {
        if(is_plus_17=="true"){is_plus_17=1}else{is_plus_17=0};if(data[1][0].rank=="مدير"){is_plus_17=",is_plus_17="+is_plus_17}else{is_plus_17=""}
        var query="update chapters set chapter_number="+conn.escape(chapter_number)+",chapter_label="+conn.escape(chapter_label)+",folder="+folder+is_plus_17+" where id="+conn.escape(id);
        conn.query(query,function(err,data)
        {
          if(err) throw err;
          set_activity(2,req.session.uid,conn.escape(id))
          resp.end("1");
        })

      }
      }
      
    })
  }
}


function delete_chapter(req,resp)
{
  id=req.body.id.trim();
  if(isNaN(id)){resp.end()}else
  {
     conn.query("select * from chapters where id="+conn.escape(id)+" and (by_team=(select team_number from team_members where member_id="+req.session.uid+" and permission=4 and team_members.team_number=chapters.by_team) or (select rank from users where id="+req.session.uid+")='مدير');",function(err,data)
     {
      if(err) throw err;
      if(data.length>0)
      {
         conn.query("update chapters set deleted=1 where id="+data[0].id,function(err,updated)
         {
          if(err) throw err;
          set_activity(3,req.session.uid,conn.escape(id))
          resp.end("1");
         })
      }
     })
  }

}




function error_page(req,resp)
{
  resp.render("error")
}



function library(req,resp)
{ var class_query="";if(req.query.class_query){class_query=req.query.class_query}
  var query= "select classifecation,series_author from series;";
      query+="select min(series_product_date) as min_year,max(series_product_date) max_year from series where series_product_date<>0;";
      query+="SELECT min(chapters_count) as min_chapters,max(chapters_count) as max_chapters FROM (select count(id) as chapters_count from chapters where deleted=0 group by series_number) as chapters;";
      query+="select min(folders_count) min_folder,max(folders_count) max_folder from (select count(DISTINCT folder) as folders_count from chapters where deleted=0 group by series_number) as folders;";
      query+="select min(seen_number) as min_seen,max(seen_number) as max_seen from (select sum(seen_number) as seen_number from chapters where deleted=0 group by series_number) as seen_numbers;"
      
  conn.query(query,function(err,data)
  {
    if(err) throw err;
                 var hint_array=new Array();
                 var author_hint=new Array();
                 for(var i=0;i<data[0].length;i++)
                    {
                        var one_row_class=data[0][i].classifecation.split(",");
                        hint_array=  hint_array.concat(one_row_class);
                        author_hint.push(data[0][i].series_author);
                        if(i==data[0].length-1)
                          {
                            hint_array=hint_array.unique().remove("");
                            author_hint=author_hint.unique().remove("");
                                resp.render("library",{classes:hint_array,authors:author_hint,counts:data,class_query:class_query,recent:req.query.recent,trending:req.query.trending,most_watch:req.query.most_watch,recommanded:req.query.recommanded})
                          }
                    }
  })
  
}




function manga_filter_form(req,resp)
{

 var query="select series.id,series.series_name,series.series_profile,series.classifecation,series.series_description,series.add_date,reactions.stars,likes_reactions.likes,comments.comment_on,recommanded.recommanded from series left join (select group_concat(reaction) as stars,manga_number from reactions where reaction in (11,12,13,14,15) group by manga_number) as reactions on series.id=reactions.manga_number left join (select count(id) as likes,manga_number from reactions where reaction=7 group by manga_number) as likes_reactions on series.id=likes_reactions.manga_number left join (select count(id) as recommanded,manga_number from reactions where reaction in (1,2) group by manga_number) as recommanded on series.id=recommanded.manga_number left join (select count(id) as comments_count,comment_on from comments where type='series' group by comment_on) as comments on series.id=comments.comment_on left join (select sum(seen_number) as seen_count,count(DISTINCT chapter_number) as chapters_count,count(DISTINCT folder) as folders_count,series_number from chapters where chapters.deleted=0 group by series_number) as chapters_count_join on series.id=chapters_count_join.series_number where series.deleted=0"
 var from=req.body.from.trim();
 var product_year=req.body.product_year.trim();
 var chapters_query=req.body.chapters.trim();
 var folders_query=req.body.folders.trim();
 
 var classes=req.body.classes;if(classes==undefined){classes=""}var classes_query=" and (";if(typeof classes == "object"){classes.forEach(function(clas,index){classes_query+=" series.classifecation like  '%"+clas+"%' and "})}else if(classes!=""){classes_query+=" series.classifecation like '%"+classes+"%' and "};classes_query+=" 1=1 )";if(classes==""){classes_query=""}
 var status=req.body.status;if(status==undefined){status=""} if(status!=""){status=" and series.status_of_manga in ("+conn.escape(status)+")"}
 var authors=req.body.authors;if(authors==undefined){authors=""}if(authors!=""){authors=" and series.series_author like "+conn.escape("%"+authors+"%")};
 var radio_value=req.body.radio_filter;var radio_query="";var folders_and_chapters_count_query=""
 if(radio_value=="most_watch"){radio_query="order by chapters_count_join.seen_count desc"}
 if(radio_value=="most_recent"){radio_query="order by series.add_date desc"}
 if(radio_value=="most_trending"){radio_query="order by likes_reactions.likes desc,comments.comment_on desc"}
 if(radio_value=="recommanded"){radio_query="order by recommanded.recommanded desc"}
  radio_query+= (radio_query!="") ? ",series_product_date asc" : "order by series_product_date asc"
    folders_and_chapters_count_query+= (chapters_query!="-1") ?  " and chapters_count_join.chapters_count >= "+chapters_query  : ""
    folders_and_chapters_count_query+= (folders_query!="-1")  ?  " and chapters_count_join.folders_count >="+folders_query : ""
  year_query= (product_year!="-1") ? " and  series_product_date >="+product_year : "";
  query+=year_query+status+authors+classes_query+folders_and_chapters_count_query+" "+radio_query+" limit "+from+",36"
  console.log(query);
 conn.query(query,function(err,data)
 {
  if(err) throw err;
  if(data.length==0){resp.end("0")}
  data.forEach(function(series,index)
  { 
    var stars_array=series.classifecation.split(",");
    rank=(5*stars_array.element_counter(15) + 4*stars_array.element_counter(14) + 3*stars_array.element_counter(13) + 2*stars_array.element_counter(12) + 1*stars_array.element_counter(11)) / (stars_array.element_counter(15)+stars_array.element_counter(14)+stars_array.element_counter(13)+stars_array.element_counter(12)+stars_array.element_counter(11));if(isNaN(rank)){rank=0};data[index].stars=getStars(rank);
    if(series.series_profile==1){data[index].series_profile=get_photo_link("manga-profiles",series.id);}else {data[index].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}
    if(data.length-1==index){resp.send(data);resp.end();}
  })
 })





}



function profile(req,resp)
{
  var id=req.params.id.trim();
  conn.query("select * from users where id="+conn.escape(id)+";select id from users where (id="+(req.session.uid || 0)+" and rank='مدير') or "+(req.session.uid || 0)+"="+conn.escape(id)+";select *,(select team_name from teams where teams.id=chapters.by_team) as team_name,(select series_name from series where series.id=chapters.series_number) as series_name from chapters where deleted=0 and by_team in (select team_number from team_members where member_id="+conn.escape(id)+" and member_status=1);select * from teams where id in (select team_number from team_members where member_id="+conn.escape(id)+") and active=1;select * from series where deleted=0 and id in (select DISTINCT manga_number from reactions where reaction=7 and by_number="+conn.escape(id)+");select * from series where deleted=0 and id in (select DISTINCT manga_number from reactions where reaction=1 and by_number="+conn.escape(id)+");select * from series where deleted=0 and id in (select DISTINCT manga_number from reactions where reaction=2 and by_number="+conn.escape(id)+");select * from series where deleted=0 and id in (select DISTINCT manga_number from reactions where reaction=3 and by_number="+conn.escape(id)+");select * from series where deleted=0 and id in (select DISTINCT manga_number from reactions where reaction=4 and by_number="+conn.escape(id)+");select * from series where deleted=0 and add_by="+conn.escape(id),function(err,data)
  {
     if(err) throw err;
     if(data[0].length==0){resp.redirect("/error");}else
     {
        if(data[0][0].profile_photo==1){data[0][0].profile_photo=get_photo_link("menu-profile",data[0][0].id)}else{data[0][0].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}
        data[3].forEach(function(team,index){if(data[3][index].team_profile==1){data[3][index].team_profile=get_photo_link("team-profile",team.id);}else{data[3][index].team_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
        resp.render("profile",{data:data});
     }
  })
  
}



function team(req,resp)
{
  id=req.params.id.trim();
  var query="select * from teams where id="+conn.escape(id)+";";
      query+="select id from users where id="+(req.session.uid || 0)+" and (rank='مدير' or (select permission from team_members where member_id="+(req.session.uid || 0)+" and member_status=1 and team_number="+conn.escape(id)+")=4);"
      query+="select member_status from team_members where member_id="+(req.session.uid || 0)+" and team_number="+conn.escape(id)+";";
      query+="select * from series where deleted=0 and id in (select series_number from chapters where by_team="+id+");";
      query+="select *,users.id as user_id,team_members.type as type from users left join team_members on team_members.member_id=users.id where team_members.member_status<>0 and team_members.team_number="+conn.escape(id)+";"
      query+="select *,chapters.id as chapter_id,series.series_name as series_name from chapters left join series on series.id=chapters.series_number where chapters.by_team="+conn.escape(id)+" and chapters.deleted=0 and series.deleted=0"
  conn.query(query,function(err,data)
  { if(err) throw err;
    if(data[0].length==0){resp.redirect("/error")}else
    {
       if(data[0][0].wallpaper==1){data[0][0].wallpaper=get_photo_link("team-wallpaper",data[0][0].id)}else{data[0][0].wallpaper="/img/main/de_wallpaper.jpg"}
       if(data[0][0].team_profile==1){data[0][0].team_profile=get_photo_link("team-profile",data[0][0].id)}else{data[0][0].team_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}
       if(data[0][0].website!=null)if(data[0][0].website.indexOf("http")==-1 && data[0][0].website!="" && data[0][0].website!=null){data[0][0].website="http://"+data[0][0].website}
       if(data[0][0].facebook_page!=null)if(data[0][0].facebook_page.indexOf("http")==-1 && data[0][0].facebook_page!="" && data[0][0].facebook_page!=null){data[0][0].facebook_page="http://"+data[0][0].facebook_page}
       if(data[0][0].twitter_page!=null)if(data[0][0].twitter_page.indexOf("http")==-1 && data[0][0].twitter_page!="" && data[0][0].twitter_page!=null){data[0][0].twitter_page="http://"+data[0][0].twitter_page}
       data[4].forEach(function(user,index){if(user.profile_photo==1){data[4][index].profile_photo=get_photo_link("menu-profile",user.user_id)}else{data[4][index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
       resp.render("team",{data:data})
    }
  })
  
}




function upload_team_wallpaper(req,resp)
{  
  if(!req.session.uid){resp.end("يجب تسجيل الدخول أولا");}else
  { var id=req.body.id.trim()
    if(!req.file){resp.end()}else
    {  
       conn.query("select id from teams where id=(select team_number from team_members where team_number=teams.id and permission=4 and member_id="+req.session.uid+") or (select id from users where id="+req.session.uid+" and rank='مدير')="+req.session.uid,function(err,data)
       { 
        if(err) throw err;
        if(data.length==0){resp.end("ليس لديك صلاحيات")}else
        {
          
          var ext=pathm.extname(req.file.originalname);
        if(ext != ".jpg" && ext != ".png" && ext != ".jpeg"){resp.end();}else
        {
            if(req.file.size/1024/1024>5){resp.end()}else
            {
                  
                  if(err) throw err;
                  Jimp.read(req.file.path, (err, lenna) => {
                  if (err) throw err;
                  lenna
                         .background(0xFFFFFFFF)
                         .resize(Jimp.AUTO, 800)
                         .write(get_photo_link('team-wallpaper',id,true));
                         conn.query("update teams set wallpaper=1 where id="+conn.escape(id));
                         resp.end("1");
                         
                         
                                
                        })

                 

                

            }
        }

        }
       })
    }
  }
}




function join_or_disjoin(req,resp)
{
  var id=req.body.id;
  var respo=new Object();
  if(!req.session.uid){respo.type="error";respo.body="يجب تسجيل الدخول أولا";resp.send(respo)}else
  {
      conn.query("select member_status,id from team_members where team_number="+conn.escape(id)+" and member_id="+req.session.uid+";select id from teams where id="+conn.escape(id)+" and team_creator="+req.session.uid+";select count(id) as cnt from team_members where team_number="+conn.escape(id)+";",function(err,data)
      { 
        if(err) throw err;
        if(data[1].length>0){respo.type="error";respo.body="لايمكن لقائد الفريق مغادرة الفريق";resp.send(respo)}else
        if(data[0].length==1){conn.query("delete from  team_members  where  team_number="+conn.escape(id)+" and member_id="+req.session.uid,function(err,data){if(err) throw err;respo.type="success";respo.body="الإنضمام";resp.send(respo)})}else
        if(data[2][0].cnt>=50){respo.type="error";respo.body="الفريق وصل للحد الأظمي من الأعضاء";resp.send(respo);}else
        if(data[0].length==0){conn.query("insert into team_members (member_id,team_number,member_status,permission) values ("+req.session.uid+","+conn.escape(id)+",0,1)",function(err,data){if(err) throw err;respo.type="success";respo.body="إلغاء الطلب";resp.send(respo)})}

      })
  }
}




function manga(req,resp)
{
  var id=req.params.id.trim();
  var global_rank_query="select rank from (SELECT @curRank := @curRank + 1 as rank,series_name,id from (select * from series order by (select count(seen_number) from chapters where  series_number=series.id) desc) as series ,(SELECT @curRank := 0) r) as rank_table where id="+conn.escape(id);
  conn.query("select *,(select count(id) from users where id="+(req.session.uid || 0)+" and (rank='مدير' or (select add_by from series where id="+conn.escape(id)+")="+(req.session.uid || 0)+")) as this_user,(select count(id) from reactions where manga_number="+conn.escape(id)+" and reaction=1) as reading,(select count(id) from reactions where manga_number="+conn.escape(id)+" and reaction=2) as want_read,(select count(id) from reactions where manga_number="+conn.escape(id)+" and reaction=3) as delay_read,(select count(id) from reactions where manga_number="+conn.escape(id)+" and reaction=4) as complete_read,(select count(id) from reactions where manga_number="+conn.escape(id)+" and reaction=5) as stop_read,(select sum(seen_number) from chapters where deleted=0 and series_number="+conn.escape(id)+") as seen_count,(select count(id) from reactions where reaction=7 and manga_number="+conn.escape(id)+") as likes,(select count(id) from reactions where reaction=11 and manga_number="+conn.escape(id)+") as one_star,(select count(id) from reactions where reaction=12 and manga_number="+conn.escape(id)+") as two_star,(select count(id) from reactions where reaction=13 and manga_number="+conn.escape(id)+") as three_star,(select count(id) from reactions where reaction=14 and manga_number="+conn.escape(id)+") as four_star,(select count(id) from reactions where reaction=15 and manga_number="+conn.escape(id)+") as five_star,(select GROUP_CONCAT(DISTINCT folder) from chapters where series_number="+conn.escape(id)+" and deleted=0) as folders_array,(select count(DISTINCT folder) from chapters where series_number="+conn.escape(id)+" and deleted=0) as folders,(select count (DISTINCT chapter_number) from chapters where series_number="+conn.escape(id)+" and deleted=0) as chapters from series where id="+conn.escape(id)+" and deleted=0;"+global_rank_query+";select reaction from reactions where manga_number="+conn.escape(id)+" and by_number="+(req.session.uid || 0)+";select team_name,id from teams where id in (select by_team from chapters where deleted=0 and series_number="+id+");select rank from users where id="+(req.session.uid || 0)+" and rank='مدير'",function(err,data)
  {  console.log(data[4])
    if(err) throw err;
    if(data[0].length==0){resp.redirect("/error")}else
    {
       if(data[0][0].wallpaper==1){data[0][0].wallpaper=get_photo_link("manga-wallpaper",data[0][0].id)}else{data[0][0].wallpaper="/img/main/de_wallpaper.jpg";}
       if(data[0][0].series_profile==1){data[0][0].series_profile=get_photo_link("manga-profiles",data[0][0].id)}else{data[0][0].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg";}
       var s_array=new Array();data[0][0].source.split(",").forEach(function(source,index){;var obj=new Object();obj.source_name=source.substr(0,source.indexOf("::")-1);obj.source_link=source.substr(source.indexOf("::")+2);s_array.push(obj);if(index==data[0][0].source.split(",").length-1){data[0][0].source=s_array}})
       rank_obj=new Object();rank=(5*data[0][0].five_star + 4*data[0][0].four_star + 3*data[0][0].three_star + 2*data[0][0].two_star + 1*data[0][0].one_star) / (data[0][0].five_star+data[0][0].four_star+data[0][0].three_star+data[0][0].two_star+data[0][0].one_star);if(isNaN(rank)){rank=0};rank_obj.rank=rank;rank_obj.stars=getStars(rank);data[0][0].rank=rank_obj;
       star_reactions_count=(data[0][0].five_star+data[0][0].four_star+data[0][0].three_star+data[0][0].two_star+data[0][0].one_star);data[0][0].star_reactions_count=star_reactions_count;
       all_reading_reactions_counts=data[0][0].reading+data[0][0].want_read+data[0][0].delay_read+data[0][0].complete_read+data[0][0].stop_read;data[0][0].all_reading_reactions_counts=all_reading_reactions_counts;
       resp.render("manga",{data:data,comment_id:req.query.comment_id})
    }
  })
  
}



function get_chapters(req,resp)
{  
  var folder=req.body.folder_number.trim();
  var series=req.body.series.trim();
  conn.query("SELECT GROUP_CONCAT(by_team) as teams,GROUP_CONCAT(id) as ids,max(add_date) as date,max(chapter_label) as label,chapter_number,sum(seen_number) as seen,sum(download_number) as download FROM `chapters` WHERE deleted=0 and series_number="+conn.escape(series)+" and folder="+conn.escape(folder)+" GROUP BY chapter_number",function(err,data)
  { if(err) throw err; 
    data.forEach(function(row,i)
    {


    var teams_ids=data[i].teams.split(",");
    teams_ids.forEach(function(team_id,index)
    {
      conn.query("select team_name from teams where id="+team_id,function(err,team_name)
      {     if(err) throw err;
            teams_ids[index]=team_name[0].team_name;
            if(teams_ids.length-1==index){data[i].teams=teams_ids.join(",")}
            if(teams_ids.length-1==index && data.length-1==i){;resp.send(data);}
      })
    })
    
    })
   
    

  })
}







function upload_series_wallpaper(req,resp)
{  
  if(!req.session.uid){resp.end("يجب تسجيل الدخول أولا");}else
  { var id=req.body.id.trim()
    if(!req.file){resp.end()}else
    {  
       conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
       { 
        if(err) throw err;
        if(data.length==0){resp.end("ليس لديك صلاحيات")}else
        {
          
          var ext=pathm.extname(req.file.originalname);
        if(ext != ".jpg" && ext != ".png" && ext != ".jpeg"){resp.end();}else
        {
            if(req.file.size/1024/1024>5){resp.end()}else
            {
                  
                  if(err) throw err;
                  Jimp.read(req.file.path, (err, lenna) => {
                  if (err) throw err;
                  lenna
                         .background(0xFFFFFFFF)
                         .resize(Jimp.AUTO, 800)
                         .write(get_photo_link('manga-wallpaper',id,true));
                         conn.query("update series set wallpaper=1 where id="+conn.escape(id));
                         resp.end("1");
                         
                         
                                
                        })

                 

                

            }
        }

        }
       })
    }
  }
}



function like_manga(req,resp)
{
  if(!req.session.uid){resp.end("يجب تسجيل الدخول أولا")}else
  {
    var  id=req.body.id.trim()
  conn.query("select id from reactions where manga_number="+conn.escape(id)+" and reaction=7 and by_number="+req.session.uid,function(err,data)
  {
    if(err) throw err;
    if(data.length==0){conn.query("insert into reactions (manga_number,reaction,by_number) values("+conn.escape(id)+",7,"+req.session.uid+")")}
    else{conn.query("delete from reactions where manga_number="+conn.escape(id)+" and reaction=7 and by_number="+req.session.uid)}
    resp.end("1")
  })
  }

}



function reader(req,resp)
{ var id=conn.escape(req.params.id.trim());
  conn.query("update chapters set seen_number=seen_number+1 where id="+id)
  conn.query("select *,(select count(id) from series where deleted=0 and id=(select series_number from chapters where id="+id+")) as not_deleted_series,(select shorte_code from teams where id=(select by_team from chapters where id="+id+")) as shorte_code,(select shorte_active from teams where id=(select by_team from chapters where id="+id+")) as shorte_active,(select id from chapters where deleted=0 and series_number=(select series_number from chapters where id="+id+") and chapter_number>(select chapter_number from chapters where id="+id+") order by chapter_number limit 1) as next_chapter_id,(select id from chapters where deleted=0 and series_number=(select series_number from chapters where id="+id+") and chapter_number<(select chapter_number from chapters where id="+id+") order by chapter_number desc limit 1) as prev_chapter_id,(select series_name from series where id=(select series_number from chapters where id="+id+")) as series_name,(select team_name from teams where id=(select by_team from chapters where id="+id+")) as team_name from chapters where id="+id+" and deleted=0;select id,team_name,(select  id from chapters where by_team=teams.id and series_number=(select series_number from chapters where id="+id+") and chapter_number=(select chapter_number from chapters where id="+id+") limit 1) as chapter_id from teams where id in (select by_team from chapters where chapter_number=(select chapter_number from chapters where id="+id+") and series_number=(select series_number from chapters where id="+id+"));select  chapter_number,min(id) as id from chapters where series_number=(select series_number from chapters where id="+id+") group by chapter_number order by chapter_number;select id from users where id="+(req.session.uid || 0)+" and (rank='مدير' || ((select by_team from chapters where id="+id+")=(select team_number from team_members where member_id="+(req.session.uid || 0)+" and permission=4 and member_status=1 and team_number=(select by_team from chapters where id="+id+"))))",function(err,data)
  {  
    if(data[0].length==0 || data[0][0].not_deleted_series==0){resp.redirect("/error")}else
    {  
       
      if(new Date().getTime()-new Date(data[0][0].add_date).getTime()<(3*24*60*60*1000) && data[0][0].shorte_active==1 && data[0][0].shorte_code!="" && data[0][0].shorte_code!=null && (req.query.token!=req.cookies.reader_token || !req.cookies.reader_token) ){var token=md5(Math.random());resp.cookie('reader_token',token, { maxAge: 300000});shorte({ token: data[0][0].shorte_code, url: req.protocol + '://' + req.get('host') + req.originalUrl+"?token="+token}).then(shorte_info => {resp.redirect(shorte_info.shortenedUrl)}).catch(function(err){console.log(err)})}else
       {
        fs.readdir(__dirname+"/chapter_photos/"+data[0][0].series_number+"/"+data[0][0].by_team+"/"+data[0][0].id+"/",function(err,files)
        { 
          if(err) throw err;
          var res="high";if(req.cookies.mid_res){res="med"}
          var files_array=new Array();
          for(var i=0;i<(files.length/2);i++)
          {
              files_array.push("/chapters/"+data[0][0].series_number+"/"+data[0][0].by_team+"/"+data[0][0].id+"/"+i+"-"+data[0][0].token+"-"+res+".jpg")
              if((files.length/2)-1==i){resp.render("reader",{data:data,files_array:files_array,comment_id:req.query.comment_id})}
          }

        })
       }
    }
  })
  
}


function get_news_box(req,resp)
{

 var from=parseInt(req.body.index)*10;
 conn.query("select id,label,add_date,body,by_member,(select username from users where id=news.by_member) as username,(select count(id) from comments where type='new' and comment_on=news.id) as comments from news where deleted=0 limit "+from+",10",function(err,data)
 {
  if(err) throw err;

      data.forEach(function(one_new,index)
        {
          data[index].label=Buffer.from(one_new.label,'base64').toString('utf8');
          data[index].wallpaper=get_photo_link("news-wallpaper",one_new.id);
          data[index].body=Buffer.from(one_new.body,'base64').toString("utf8");
          var $ = cheerio.load(data[index].body);
          $('body').find("img").remove()
          data[index].body=$('body').contents().first().text()

        })
      resp.send(data);
  
 })

}



function news(req,resp)
{  
  
  resp.render("news")
  
}



function new_page(req,resp)
{ var id=conn.escape(req.params.id.trim());
  conn.query("select *,(select username from users where id=news.by_member) as username,(select profile_photo from users where id=news.by_member) as profile_photo from news where deleted=0 and id="+id+";select id from users where id="+(req.session.uid || 0)+" and rank='مدير'",function(err,data)
  {
    if(err) throw err;
    if(data[0].length==0){resp.redirect("/error")}else
    {   data[0][0].label=Buffer.from(data[0][0].label,'base64').toString('utf8')
        data[0][0].body=Buffer.from(data[0][0].body,'base64').toString('utf8')
        data[0][0].wallpaper=get_photo_link("news-wallpaper",data[0][0].id)
        if(data[0][0].profile_photo==1){data[0][0].profile_photo=get_photo_link("menu-profile",data[0][0].by_member)}
        resp.render("new",{data:data,comment_id:req.query.comment_id});
    }
  })
  
}


function add_news(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    if(!req.file){resp.end()}else
    { var body=req.body.body.trim();
      var label=req.body.label.trim();
      if(body=="" || label==""){resp.end("بعض الحقول الضرورية فارغة")}else
      {
        conn.query("select id from users where rank='مدير' and id="+req.session.uid,function(err,data)
        {
          if(err) throw err;
          if(data.length==0){resp.end()}else
          { 
            var ext=pathm.extname(req.file.originalname);
        if(ext != ".jpg" && ext != ".png" && ext != ".jpeg"){resp.end();}else
        {
            if(req.file.size/1024/1024>5){resp.end()}else
            {
                  conn.query("insert into news (by_member,label,body) values("+req.session.uid+","+conn.escape(Buffer.from(label).toString('base64'))+","+conn.escape(Buffer.from(body).toString('base64'))+") ",function(err,data)
            {
              if(err) throw err;

                  Jimp.read(req.file.path, (error, lenna) => {
                  if (error) throw error;
                  lenna
                         .background(0xFFFFFFFF)
                         .resize(Jimp.AUTO, 800)
                         .write(get_photo_link('news-wallpaper',data.insertId,true));
                         resp.end("1");
                         
                         
                                
                        })
              
            })
                  

                 

                

            }
        }

            
          }
        })
      }
    }
  }
}




function get_add_news_modal(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where rank='مدير' and id="+req.session.uid,function(err,data)
    {
      if(err) throw err;
      resp.render("add_news")
    })
  }
}



function remove_news(req,resp)
{ var id=req.body.id.trim();
  if(!req.session.uid){resp.end("1")}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير' ",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {
        conn.query("update news set deleted=1 where id="+id,function(err,data)
        {
          if(err) throw err;
          resp.end("1")
        })
      }
    })
  }
}

function cpanel(req,resp)
{ if(!req.session.uid){resp.end()}else
{  
   conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,user)
   {
    if(err) throw err;
    if(user.length==0){resp.redirect("/error")}else
    { 
      conn.query("select (select count(id) from users where suspend=1) as blocked_users_count,(select count(id) from users where YEARWEEK(join_date)=YEARWEEK(NOW())) as new_users,(select count(id) from users where rank='مدير') as admins_count,(select count(id) from users where rank='مستخدم') as users_count from users;select (select count(id) from teams where suspend=1) as blocked_teams,(select count(id) from teams where active=0) as team_pending_count,(select count(id) from teams where shorte_active=1) as advertising_teams_count from teams;select (select count(id) from series where deleted=1) as deleted_series_count,(select count(id) from series where checked=0) as series_pending_count from series;select count(id) as deleted_chapters_count from chapters where deleted=1;select count(id) as pending_reports_count from reports where proccessed<>1;select (select count(id) from contact_session where status=0 and deleted=0) as open_session,(select count(id) from contact_session where deleted=0 and status=0 and add_by=(select add_by from contact_session_messages where session_id=contact_session.id order by add_date desc limit 1)) as waitng_sessions from contact_session limit 1",function(err,data)
      { console.log(data[5]);
        if(err) throw err;
        var type=req.query.type;
        var condition=req.query.condition
        var command=""
        var link_id=0
        var page=(req.body.page || 1)
        if(type=="user")
        {
          if(condition==1){command="get_users_table("+page+",1)"}else
            if(condition==2){command="get_users_table("+page+",2)"}else
              if(condition==3){command="get_users_table("+page+",3)"}else
                if(condition==4){command="get_users_table("+page+",4)"}else
                  if(condition==5){command="get_users_table("+page+",5)"}else
                    if(condition==6){command="get_users_table("+page+",6)"}else
                      if(condition=="one_user"){link_id=req.query.index;command=";get_users_table("+req.query.index+",'one_user');get_sessions_table(1,4);get_activity_table(1,2);get_reports_table(1,2);get_teams_table(1,1);get_series_table(1,1)"}

        }else
      if(type=="teams")
        {
          
                if(condition==4){command="get_teams_table("+page+",4)"}else
                  if(condition==5){command="get_teams_table("+page+",5)"}else
                    if(condition==6){command="get_teams_table("+page+",6)"}else
                      if(condition==7){command="get_teams_table("+page+",7)"}else
                        if(condition=="one_team"){link_id=req.query.index;command="get_teams_table("+req.query.index+",'one_team');get_activity_table(1,4);get_reports_table(1,3);get_chapters_table(1,1)"}
        }else

      if(type=="series")
        {
              if(condition==2){command="get_series_table("+page+",2)"}else
                if(condition==4){command="get_series_table("+page+",4)"}else
                  if(condition==5){command="get_series_table("+page+",5)"}else
                    if(condition==6){command="get_series_table("+page+",6)"}else
                      if(condition==3){command="get_series_table("+page+",3)"}else
                        if(condition=="one_series"){link_id=req.query.index;command="get_series_table("+req.query.index+",'one_series');get_activity_table(1,3);get_chapters_table(1,2)"}
        }else
      if(type=="chapters")
        {
              
                if(condition==4){command="get_chapters_table("+page+",4)"}else
                  if(condition==5){command="get_chapters_table("+page+",5)"}else
                      if(condition==3){command="get_chapters_table("+page+",3)"}
        }else
      if(type=="reports")
        {
            
                if(condition==4){command="get_reports_table("+page+",4)"}else
                      if(condition==1){command="get_reports_table("+page+",1)"}
        }else
       if(type=="activity")
        {
            
                
                      if(condition==1){command="get_activity_table("+page+",1)"}
        }else 
       if(type=="sessions")
        {

          if(condition==1){command="get_sessions_table("+page+",1)"}else
                if(condition==2){command="get_sessions_table("+page+",2)"}else
                  if(condition==3){command="get_sessions_table("+page+",3)"}else
                    if(condition==4){command="get_sessions_table("+page+",4)"}
           
        }else {command="get_main_cpanel_board()"}

        data[0][0].online_users_count=online_users.size
        resp.render("panel",{data:data,command:command,link_id:link_id})
      })
      
    }
   })
}
  
}



function proccess_report(req,resp)
{ 
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where rank='مدير' and id="+req.session.uid+";select id from reports where id="+req.body.id+" and (proccessed=0 or proccessed is NULL)",function(err,data)
    {  if(err) throw err;
      if(data[0].length==0 || data[1].length==0){resp.end()}else
      {  
         conn.query("UPDATE `reports` SET `proccessed`=1,`proccessed_by`="+req.session.uid+" WHERE id="+req.body.id,function(err,data)
         {
          if(err) throw err;
          resp.end()
         })
      }
    })
  }
}





function read_notification(req,resp)
{
  if(!req.session.uid){resp.end()}else
  { 
    conn.query("select * from notifications where id="+req.params.id+" and to_number="+req.session.uid,function(err,data)
    {
      if(err) throw err;
      if(data.length==0){resp.redirect("/error")}else
      {
        conn.query("update notifications set seen=1 where id="+req.params.id+" and to_number="+req.session.uid);
        if(data[0].type.split(",")[0]=="tag")
        {

            var link="";
            if(data[0].type.split(",")[1]=="new"){link="/new/"+data[0].type.split(",")[2]+"?comment_id="+data[0].type.split(",")[3]}else
            if(data[0].type.split(",")[1]=="chapter"){link="/reader/"+data[0].type.split(",")[2]+"?comment_id="+data[0].type.split(",")[3]}else
            if(data[0].type.split(",")[1]=="series"){link="/manga/"+data[0].type.split(",")[2]+"?comment_id="+data[0].type.split(",")[3]}
            else  {link="/error"}
            resp.redirect(link)


        }else if(data[0].type=="chapter")
        {resp.redirect("/reader/"+data[0].link_id);}
        else if(data[0].type.split(",")[0]="session_response"){resp.redirect('back');}
      }
    })
  }
}


function messages(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    resp.render("messages");
  }
}


function get_generals_messages(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {  var index=parseInt(req.body.index);
     conn.query("select id,body,m_from,seen,add_date,(select username from users where id=messages.m_from) as m_from_name,(select rank from users where id=messages.m_from) as rank,(select profile_photo from users where id=messages.m_from) as profile_photo from (select max(id) as id,max(add_date) as add_date,max(m_from) as m_from,max(body) as body,max(m_to) as m_to,min(seen) as seen from messages where m_to="+req.session.uid+" GROUP by m_from) as messages where m_to="+req.session.uid+" or m_from="+req.session.uid+" order by add_date desc limit "+index+",20",function(err,data)
     { 
       if(err) throw err;
       if(data.length==0){resp.end("0")}else
       {
       data.forEach(function(message,index){data[index].body=Buffer.from(data[index].body,'base64').toString('utf8');if(message.profile_photo==1){data[index].profile_photo=get_photo_link("menu-profile",message.m_from)}else{data[index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
       resp.send(data);
       resp.end();
       }

     })
  }
}




function mark_all_messages_reader(req,resp)
{
  conn.query("update messages set seen=1 where m_to="+(req.session.uid || 0),function(err,data)
  { if(err) throw err;
    resp.end("1")
  })
}




function chat_box(req,resp)
{  var id=req.body.id;
  if(!req.session.uid || isNaN(id)){resp.end()}else
  {
    conn.query("select username,id from users where id="+id+";update messages set seen=1 where (m_to="+req.session.uid+" and m_from="+id+")",function(err,data)
    {
      if(err) throw err;
      resp.render("chat",{data:data});
    })
    
  }

}



function get_chat_box_message(req,resp)
{ var index=req.body.index;
  var to=req.body.to;
   if(!req.session.uid || isNaN(index) || isNaN(to)){resp.end("0")}else
   {
       conn.query("select * from messages where  (m_to="+req.session.uid+" and m_from="+to+") or (m_to="+to+" and m_from="+req.session.uid+") order by add_date desc limit "+index+",20;select username from users where id="+to,function(err,data)
       {
          if(err) throw err;
          data[0].forEach(function(message,index){data[0][index].body=Buffer.from(data[0][index].body,'base64').toString('utf8');;if(message.m_from==req.session.uid){data[0][index].m_from="أنت";data[0][index].m_to=data[1][0].username}else{data[0][index].m_from=data[1][0].username;data[0][index].m_to="أنت"}})
          resp.send(data);
          resp.end();
       })
   }
}



function send_message(req,resp)
{
  if(!req.session.uid){resp.end()}else
  { var body=req.body.message.trim();
    var id=parseInt(req.body.to);
    if(body==""){resp.end()}else
    { body=conn.escape(Buffer.from(body).toString('base64'));
      conn.query("insert into messages (m_from,m_to,body,seen) values ("+req.session.uid+","+id+","+body+",0)",function(err,data)
      { emit_message_to_socket("message",req.body.message.trim(),id,req.session.username,req.session.uid)

        if(err) throw err;
        resp.end("1")
      })
    }
    
  }

}





function read_reaction(req,resp)
{
  if(!req.session.uid){resp.end("يجب تسجيل الدخول أولا")}else
  {
     var id=parseInt(req.body.manga);
     var read_mode=parseInt(req.body.option);
     conn.query("update reactions set reaction="+read_mode+" where by_number="+req.session.uid+" and manga_number="+id+" and reaction in (1,2,3,4,5)",function(err,data)
     {
      if(err) throw err;
      if(data.affectedRows==0){conn.query("insert into reactions (by_number,manga_number,reaction) values ("+req.session.uid+","+id+","+read_mode+")")}
      resp.end("1");
     })
  }
}


function rank_reaction(req,resp)
{
  if(!req.session.uid){resp.end("يجب تسجيل الدخول أولا")}else
  {
     var id=parseInt(req.body.manga);
     var reaction_mode=parseInt(req.body.option);if(reaction_mode==1){reaction_mode=11};if(reaction_mode==2){reaction_mode=12};if(reaction_mode==3){reaction_mode=13};if(reaction_mode==4){reaction_mode=14};if(reaction_mode==5){reaction_mode=15}
     conn.query("update reactions set reaction="+reaction_mode+" where by_number="+req.session.uid+" and manga_number="+id+" and reaction in (11,12,13,14,15)",function(err,data)
     {
      if(err) throw err;
      if(data.affectedRows==0){conn.query("insert into reactions (by_number,manga_number,reaction) values ("+req.session.uid+","+id+","+reaction_mode+")")}
      resp.end("1");
     })
  }
}




function delete_series(req,resp)
{
  if(!req.session.uid || !req.body.id){resp.end()}else
  { var id=conn.escape(req.body.id);
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {
        conn.query("update series set deleted=1 where id="+id,function(err,data)
        {
          if(err) throw err;
          set_activity(6,req.session.uid,id);
          resp.end("1")
        })
      }
    })
  }

}


function users_table(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {  var condition=req.body.condition;
         var from=req.body.index;if(condition!="one_user"){from=((req.body.index-1) || 0)*50;}
         var query="";
         if(condition=="one_user"){query="select *,id,(select count(id) from teams where  id in (select team_number from team_members where member_id=users.id and member_status=1)) as teams_count,(select count(id) from reports where by_member=users.id) as reports_count,(select count(id) from reactions where by_number=users.id) as reactions_count,(select count(id) from series where add_by=users.id) as series_count from users where id="+conn.escape(req.body.index);}else
         if(condition=="1"){query="select *,id,(select count(id) from teams where  id in (select team_number from team_members where member_id=users.id and member_status=1)) as teams_count,(select count(id) from reports where by_member=users.id) as reports_count,(select count(id) from reactions where by_number=users.id) as reactions_count,(select count(id) from series where add_by=users.id) as series_count,(select count(id) from users) as users_counts from users order by join_date desc limit "+from+",50"}else
         if(condition=="2"){query="select *,id,(select count(id) from teams where  id in (select team_number from team_members where member_id=users.id and member_status=1)) as teams_count,(select count(id) from reports where by_member=users.id) as reports_count,(select count(id) from reactions where by_number=users.id) as reactions_count,(select count(id) from series where add_by=users.id) as series_count,(select count(id) from users where suspend=1) as users_counts from users where suspend=1 limit "+from+",50"}else
         if(condition=="3"){query="select *,id,(select count(id) from teams where  id in (select team_number from team_members where member_id=users.id and member_status=1)) as teams_count,(select count(id) from reports where by_member=users.id) as reports_count,(select count(id) from reactions where by_number=users.id) as reactions_count,(select count(id) from series where add_by=users.id) as series_count,(select count(id) from users where rank='مدير') as users_counts from users where rank='مدير' limit "+from+",50"}else
         if(condition=="4"){query="select *,id,(select count(id) from teams where  id in (select team_number from team_members where member_id=users.id and member_status=1)) as teams_count,(select count(id) from reports where by_member=users.id) as reports_count,(select count(id) from reactions where by_number=users.id) as reactions_count,(select count(id) from series where add_by=users.id) as series_count,(select count(id) from users where rank='مستخدم') as users_counts from users where rank='مستخدم' limit "+from+",50"}else
         if(condition=="5"){var online_users_value=new Array;if(online_users.size>0){online_users_value.push(Array.from( online_users.keys()))}else{online_users_value.push(0)};;query="select *,id,(select count(id) from teams where  id in (select team_number from team_members where member_id=users.id and member_status=1)) as teams_count,(select count(id) from reports where by_member=users.id) as reports_count,(select count(id) from reactions where by_number=users.id) as reactions_count,(select count(id) from series where add_by=users.id) as series_count,(select count(id) from users where id in ("+online_users_value+")) as users_counts from users where id in ("+online_users_value+") limit "+from+",50"}else
         if(condition=="6"){query="select *,id,(select count(id) from teams where  id in (select team_number from team_members where member_id=users.id and member_status=1)) as teams_count,(select count(id) from reports where by_member=users.id) as reports_count,(select count(id) from reactions where by_number=users.id) as reactions_count,(select count(id) from series where add_by=users.id) as series_count,(select count(id) from users where YEARWEEK(join_date)=YEARWEEK(NOW())) as users_counts from users where YEARWEEK(join_date)=YEARWEEK(NOW()) limit "+from+",50"}
        conn.query(query,function(err,data)
        { if(data.length==0){resp.end("")}else{
          if(err) throw err;
        
         

          data.forEach(function(user,index){data[index].join_date=moment(user.join_date).format('DD-MM-YYYY');conn.query("select username from users where id="+(user.suspend_by || 0),function(err,suspender){if(err) throw err;if(suspender.length>0)data[index].suspend_by_user=suspender[0].username;if(data.length-1==index){resp.render("users_table",{condition:condition,data:data,current_page:req.body.index})}})})
                                                }
        })


      }
    })
  }
}


function teams_table(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {  var condition=req.body.condition;
         var from=req.body.index;if(condition!="one_team"){from=((req.body.index-1) || 0)*50;}
         var query="";
         if(condition=="one_team"){query="select *,team_creator,id,suspend_by,(select count(id) from teams) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams where id="+conn.escape(req.body.index);}else
         if(condition=="1"){query="select *,team_creator,id,suspend_by,(select count(id) from teams where id in (select team_number from team_members where member_id="+conn.escape(req.body.link_id)+" and member_status=1)) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams where id in (select team_number from team_members where member_id="+conn.escape(req.body.link_id)+" and member_status=1) limit "+from+",50"}else
         if(condition=="2"){query="select *,team_creator,id,suspend_by,(select count(id) from teams where id in (select by_team from chapters where deleted=0 and chapter_number=(select chapter_number from chapters where id="+conn.escape(req.body.link_id)+") and series_number=(select series_number from chapters where id="+conn.escape(req.body.link_id)+"))) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams where id in (select by_team from chapters where deleted=0 and chapter_number=(select chapter_number from chapters where id="+conn.escape(req.body.link_id)+") and series_number=(select series_number from chapters where id="+conn.escape(req.body.link_id)+")) limit "+from+",50"}else
         if(condition=="3"){query="select *,team_creator,id,suspend_by,(select count(id) from teams where id in (select by_team from chapters where series_number="+conn.escape(req.body.link_id)+" and deleted=0)) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams where id in (select by_team from chapters where series_number="+conn.escape(req.body.link_id)+" and deleted=0)  limit "+from+",50"}else
         if(condition=="4"){query="select *,team_creator,id,suspend_by,(select count(id) from teams) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams order by create_date desc limit "+from+",50"}else
         if(condition=="5"){query="select *,team_creator,id,suspend_by,(select count(id) from teams where suspend=1) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams where suspend=1 limit "+from+",50"}else
         if(condition=="6"){query="select *,team_creator,id,suspend_by,(select count(id) from teams where active=0) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams where active=0 limit "+from+",50"}else
          if(condition=="7"){query="select *,team_creator,id,suspend_by,(select count(id) from teams where shorte_active=1) as teams_count,(select count(id) from chapters where deleted=0 and by_team=teams.id) as chapters_count,(select count(id) from team_members where member_status=1 and team_number=teams.id) as members_count,(select username from users where id=teams.suspend_by) as suspend_from,(select username from users where id=teams.team_creator) as team_leader from teams where shorte_active=1 limit "+from+",50"}
        conn.query(query,function(err,data)
        {
          if(err) throw err;
          if(data.length==0){resp.end("")}else{
          data.forEach(function(team,index){data[index].create_date=moment(team.create_date).format('DD-MM-YYYY')})
          resp.render("teams_table",{condition:condition,data:data,current_page:req.body.index})
          }
        })


      }
    })
  }
}


function series_table(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {  var condition=req.body.condition;
         var from=req.body.index;if(condition!="one_series"){from=((req.body.index-1) || 0)*50;}
         var query="";
         if(condition=="one_series"){query="select *,id,(select count(id) from reactions where manga_number=series.id) as reactions_count,(select username from users where id=series.checked_by) as checked_by_user,(select username from users where id=series.add_by) as by_user,(select count(id) from chapters where series_number=series.id) as chapters_count from series where id="+conn.escape(req.body.index);}else
         if(condition=="1"){query="select *,id,(select count(id) from series where add_by="+conn.escape(req.body.link_id)+") as series_count,(select count(id) from reactions where manga_number=series.id) as reactions_count,(select username from users where id=series.checked_by) as checked_by_user,(select username from users where id=series.add_by) as by_user,(select count(id) from chapters where series_number=series.id) as chapters_count from series where add_by="+conn.escape(req.body.link_id)+" limit "+from+",50"}else
         if(condition=="2"){query="select *,id,(select count(id) from series) as series_count,(select count(id) from reactions where manga_number=series.id) as reactions_count,(select username from users where id=series.checked_by) as checked_by_user,(select username from users where id=series.add_by) as by_user,(select count(id) from chapters where series_number=series.id) as chapters_count from series order by add_date desc limit "+from+",50"}else
         if(condition=="4"){query="select *,id,(select count(id) from series where deleted=1) as series_count,(select count(id) from reactions where manga_number=series.id) as reactions_count,(select username from users where id=series.checked_by) as checked_by_user,(select username from users where id=series.add_by) as by_user,(select count(id) from chapters where series_number=series.id) as chapters_count from series where deleted=1 limit "+from+",50"}else
         if(condition=="5"){query="select *,id,(select count(id) from series where checked=0) as series_count,(select count(id) from reactions where manga_number=series.id) as reactions_count,(select username from users where id=series.checked_by) as checked_by_user,(select username from users where id=series.add_by) as by_user,(select count(id) from chapters where series_number=series.id) as chapters_count from series where checked=0 limit "+from+",50"}else
         if(condition=="6"){query="select *,id,(select count(id) from series) as series_count,(select count(id) from reactions where manga_number=series.id) as reactions_count,(select username from users where id=series.checked_by) as checked_by_user,(select username from users where id=series.add_by) as by_user,(select count(id) from chapters where series_number=series.id) as chapters_count from series order by (select count(id) from reactions where manga_number=series.id) desc  limit "+from+",50"}
        conn.query(query,function(err,data)
        {
          if(err) throw err;
          if(data.length==0){resp.end("")}else{
        
          data.forEach(function(series,index){data[index].add_date=moment(series.add_date).format('DD-MM-YYYY');var s_array=new Array();;series.source.split(",").forEach(function(source,i){;var obj=new Object();obj.source_name=source.substr(0,source.indexOf("::")-1);obj.source_link=source.substr(source.indexOf("::")+2);s_array.push(obj);if(i==series.source.split(",").length-1){data[index].source=s_array}})})
          resp.render("series_table",{condition:condition,data:data,current_page:req.body.index})
          }
        })


      }
    })
  }
}




function chapters_table(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {  var condition=req.body.condition;
         var from=req.body.index;from=((req.body.index-1) || 0)*50;
         var query="";
         if(condition=="1"){query="select *,(select count(id) from chapters where by_team="+req.body.link_id+") as chapters_count,id,(select team_name from teams where id=chapters.by_team) as team_name,(select series_name from series where id=chapters.series_number) as series_name from chapters where by_team="+req.body.link_id+" limit "+from+",50"}else
         if(condition=="2"){query="select *,(select count(id) from chapters where series_number="+req.body.link_id+") as chapters_count,id,(select team_name from teams where id=chapters.by_team) as team_name,(select series_name from series where id=chapters.series_number) as series_name from chapters where series_number="+req.body.link_id+" limit "+from+",50"}else
         if(condition=="3"){query="select *,(select count(id) from chapters) as chapters_count,id,(select team_name from teams where id=chapters.by_team) as team_name,(select series_name from series where id=chapters.series_number) as series_name from chapters order by add_date desc limit "+from+",50"}else
         if(condition=="4"){query="select *,(select count(id) from chapters where deleted=1) as chapters_count,id,(select team_name from teams where id=chapters.by_team) as team_name,(select series_name from series where id=chapters.series_number) as series_name from chapters where deleted=1 limit "+from+",50"}else
         if(condition=="5"){query="select *,(select count(id) from chapters) as chapters_count,id,(select team_name from teams where id=chapters.by_team) as team_name,(select series_name from series where id=chapters.series_number) as series_name from chapters order by seen_number desc limit "+from+",50"}
        conn.query(query,function(err,data)
        {
          if(err) throw err;
          if(data.length==0){resp.end("")}else{
        
          data.forEach(function(chapter,index){data[index].add_date=moment(chapter.add_date).format('DD-MM-YYYY');})
          resp.render("chapters_table",{condition:condition,data:data,current_page:req.body.index})
          }
        })


      }
    })
  }
}


function sessions_table(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {  var condition=req.body.condition;
         var from=req.body.index;from=((req.body.index-1) || 0)*50;
         var query="";
         if(condition=="1"){query="select *,(select username from users where id=contact_session.add_by) as username_by,(select username from users where id=contact_session.deleted_by) as username_deleted_by,(select username from users where id=contact_session.closed_by) as username_closed_by from contact_session order by add_date desc limit "+from+",50"}else
         if(condition=="2"){query="select *,(select username from users where id=contact_session.add_by) as username_by,(select username from users where id=contact_session.deleted_by) as username_deleted_by,(select username from users where id=contact_session.closed_by) as username_closed_by from contact_session where status=0 and deleted=0 order by add_date desc limit "+from+",50"}else
         if(condition=="3"){query="select *,(select username from users where id=contact_session.add_by) as username_by,(select username from users where id=contact_session.deleted_by) as username_deleted_by,(select username from users where id=contact_session.closed_by) as username_closed_by from contact_session where status=0 and deleted=0 and add_by=(select add_by from contact_session_messages where session_id=contact_session.id order by add_date desc limit 1) order by add_date desc limit "+from+",50"}else
         if(condition=="4"){query="select *,(select username from users where id=contact_session.add_by) as username_by,(select username from users where id=contact_session.deleted_by) as username_deleted_by,(select username from users where id=contact_session.closed_by) as username_closed_by from contact_session where add_by="+req.body.link_id+" order by add_date desc limit "+from+",50"}
        conn.query(query,function(err,data)
        {  console.log("here")
          if(err) throw err;
          if(data.length==0){resp.end("")}else{
        
          data.forEach(function(chapter,index){data[index].add_date=moment(chapter.add_date).format('DD-MM-YYYY');})
          resp.render("sessions_table",{condition:condition,data:data,current_page:req.body.index})
          }
        })


      }
    })
  }
}

function activity_table(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {  var condition=req.body.condition;
         var from=req.body.index;from=((req.body.index-1) || 0)*50;
         var query="";
         if(condition=="1"){query="select id from activity order by process_date desc limit "+from+",50"}else
         if(condition=="2"){query="select id from activity where  ((process=7 or process=8) and process_on="+req.body.link_id+") or proccess_by="+req.body.link_id+"   order by process_date desc limit "+from+",50"}else
         if(condition=="3"){query="select id from activity where  ((process=4 or process=5 or process=6 or process=12) and process_on="+req.body.link_id+") order by process_date desc limit "+from+",50"}else
         if(condition=="4"){query="select id from activity where  ((process=9 or process=10) and process_on="+req.body.link_id+") order by process_date desc limit "+from+",50"}
        conn.query(query,function(err,data)
        { 
          if(err) throw err;
          if(data.length==0){resp.end("")}else
          {
          var activity_array=new Array();
          data.forEach(function(activity,index)
          {
            
            get_activity(activity.id,function(activity)
            {
               
             activity_array.push(activity);
             if(activity_array.length==data.length){resp.render("activity_table",{condition:condition,current_page:req.body.index,data:activity_array})}

            })
          })
          
          
          
          }
        })


      }
    })
  }
}





function reports_table(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {  var condition=req.body.condition;
         var from=req.body.index;from=((req.body.index-1) || 0)*50;
         var query="";
         if(condition=="1"){query="select *,id,by_member,proccessed_by,(select username from users where id=reports.by_member) by_user,(select username from users where id=proccessed_by) as proccessed_by_user from reports order by add_date desc limit "+from+",50"}else
         if(condition=="2"){query="select *,id,by_member,proccessed_by,(select username from users where id=reports.by_member) by_user,(select username from users where id=proccessed_by) as proccessed_by_user from reports where proccessed_by="+req.body.link_id+" or by_member="+req.body.link_id+" order by add_date desc limit "+from+",50"}else
         if(condition=="3"){query="select *,id,by_member,proccessed_by,(select username from users where id=reports.by_member) by_user,(select username from users where id=proccessed_by) as proccessed_by_user from reports where report_on_id="+req.body.link_id+" order by add_date desc limit "+from+",50"}else
         if(condition=="4"){query="select *,id,by_member,proccessed_by,(select username from users where id=reports.by_member) by_user,(select username from users where id=proccessed_by) as proccessed_by_user from reports where proccessed=0 order by add_date desc limit "+from+",50"}
        conn.query(query,function(err,data)
        {
          if(err) throw err;
          if(data.length==0){resp.end("")}else{
          data.forEach(function(report,index)
            {
              data[index].add_date=moment(report.add_date).format('DD-MM-YYYY');
              var query="";
              if(report.type=="team"){query="select team_name from teams where id="+report.report_on_id}else 
              if(report.type=="chapter"){query="select chapter_number,series_number,(select series_name from series where id=chapters.series_number) as series from chapters where id="+report.report_on_id};
              conn.query(query,function(err,report_on_names)
              {
                if (err) throw err;
                if(report.type=="chapter"){data[index].report_on_names="الفصل "+report_on_names[0].chapter_number+" لسلسلة "+report_on_names[0].series;}else
                if(report.type=="team"){data[index].report_on_names=report_on_names[0].team_name;}
                if(data.length-1==index){ resp.render("reports_table",{condition:condition,data:data,current_page:req.body.index})}
              })

            })
         }
        })


      }
    })
  }
}



function proccessed_report(req,resp)
{
  if(!req.session.uid){resp.end("")}else
  {
    conn.query("select id from users where rank='مدير' and id="+req.session.uid,function(err,user)
    {
      if(err) throw err;
      if(user.length>0)
      {
        conn.query("update reports set proccessed=1,proccessed_by="+req.session.uid+" where id="+req.body.id+" and proccessed=0",function(err,data)
    {
      if(err) throw err;
      resp.end("1")
    })

      }
    })
    
  }
}



function restore_chapter(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {
        conn.query("update chapters set deleted=0 where id="+req.body.id,function(err,data)
        {
          if(err) throw err;
          set_activity(11,req.session.uid,req.body.id)
          resp.end("1")
        })
      }
    })
  }
}




function restore_series(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and rank='مدير'",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {
        conn.query("update series set deleted=0 where id="+req.body.id,function(err,data)
        {
          if(err) throw err;
          set_activity(12,req.session.uid,req.body.id)
          resp.end("1")
        })
      }
    })
  }
}




function main_cpanel_board(req,resp)
{  var obj=new Object()
   
   si.mem(function(data)
   {
     obj.total_mem=(Math.round(data.total/1024/1024/1024 * 10) / 10).toFixed(2)
     obj.free_mem=Math.ceil(data.free*100/(data.total));
     si.fsSize(function(data)
     { 

     var total_hard=0;total_used_hard=0;data.forEach(function(disk,index){total_hard+=disk.size;total_used_hard+=disk.used})
     obj.used_hard=Math.ceil(total_used_hard*100/(total_hard));
     obj.total_hard=(total_hard/1024/1024/1024).toFixed(2);
     si.currentLoad(function(data)
     {
      obj.cpu_load=Math.ceil(data.currentload)
      query="select count(id) as chapters_count,(SELECT count(id) FROM chapters WHERE DATE(add_date) = CURDATE() and deleted=0) as today_chapters from chapters where deleted=0;"
      query+="select count(id) as users_count,(select count(id) from users where Date(join_date)=CURDATE() and suspend=0) as today_users from users where suspend=0;"
      query+="select count(id) as series_count,(select count(id) from series where DATE(add_date=CURDATE() and deleted=0)) as today_series from series where deleted=0;"
      query+="select count(id) as teams_count,(select count(id) from teams where DATE(create_date)=CURDATE() and suspend=0) as today_teams from teams where suspend=0;"
      query+="select count(id) as today_activity from activity where Date(process_date)=CURDATE() ;"
      query+="select count(id) as cnt,min(add_date) as date from chapters where year(add_date) = year(CURRENT_DATE) GROUP by month(add_date);"
      query+="select count(id) as cnt,min(add_date) as date from series where year(add_date) = year(CURRENT_DATE) GROUP by month(add_date);"
      query+="select count(id) as cnt,min(join_date) as date from users where year(join_date) = year(CURRENT_DATE) GROUP by month(join_date);"
      query+="select count(id) as cnt,min(create_date) as date from teams where year(create_date) = year(CURRENT_DATE) GROUP by month(create_date);"
      query+="select count(id) as today_comments from comments where Date(add_date)=CURDATE() ;"
      query+="select count(id) as today_sessions from contact_session where Date(add_date)=CURDATE() ;"
      conn.query(query,function(err,data)
      {
        if(err) throw err;
        obj.data=data;
        data[5].forEach(function(row,index){data[5][index].date=moment(row.date).format('MMM')})
        data[6].forEach(function(row,index){data[6][index].date=moment(row.date).format('MMM')})
        data[7].forEach(function(row,index){data[7][index].date=moment(row.date).format('MMM')})
        data[8].forEach(function(row,index){data[8][index].date=moment(row.date).format('MMM')})
        resp.render("main_cpanel_board",{data:obj});

      })
      
     })


     })


  })


}



function edit_chapter_photos(req,resp)
{

  if(!req.session.uid && req.body.order_array.length!=0){resp.end()}else
  {
    var id=req.body.photos_chapter_id;
    conn.query("select * from chapters where id="+conn.escape(id)+" and (by_team=(select team_number from team_members where member_id="+req.session.uid+" and permission=4 and team_members.team_number=chapters.by_team) or (select rank from users where id="+req.session.uid+")='مدير');select 1",function(err,data)
    {
      if(err) throw err;
      if(data[0].length>0)
      {
         var path=__dirname+"/chapter_photos/"+data[0][0].series_number+"/"+data[0][0].by_team+"/"+data[0][0].id+"/";
         add_pic_to_chapter(req.files,data[0][0].token,path,function()
          {
            remove_pic_not_in_array(req.body.order_array.split(","),path,function(){reorder_pic(req.body.order_array.split(","),path,data[0][0].token,function(){resp.end("1")})});
          })
         
      }
    })
  }
}







function comment_system(req,resp)
{  conn.query("select count(id) as comments_count from comments where deleted=0 and comment_on="+req.body.oid+" and type="+conn.escape(req.body.type)+";select 1",function(err,data)
{
  if(err) throw err;
  resp.render("comment_system",{data:data,type:req.body.type,on:req.body.oid,myid:req.session.uid,comment_id:req.body.comment_id})
})
  
}


function like_comment(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
     conn.query("select id from other_reactions where reaction_on="+parseInt(req.body.oid)+" and by_member="+req.session.uid+" and type='comment' and reaction=1",function(err,data)
     {
      if(err) throw err;
    
      if(data.length==0){conn.query("delete from other_reactions where type='comment' and reaction_on="+parseInt(req.body.oid)+" and by_member="+req.session.uid+" and reaction=2");conn.query("insert into other_reactions (reaction_on,by_member,type,reaction) values ("+parseInt(req.body.oid)+","+req.session.uid+",'comment',1)")}
      else {conn.query("delete from other_reactions where type='comment' and reaction_on="+parseInt(req.body.oid)+" and by_member="+req.session.uid+" and reaction=1")}
      resp.end("1")
     })
  }
}

function dislike_comment(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
     conn.query("select id from other_reactions where reaction_on="+parseInt(req.body.oid)+" and by_member="+req.session.uid+" and type='comment' and reaction=2",function(err,data)
     {
      if(err) throw err;
     
      if(data.length==0){conn.query("delete from other_reactions where type='comment' and reaction_on="+parseInt(req.body.oid)+" and by_member="+req.session.uid+" and reaction=1");conn.query("insert into other_reactions (reaction_on,by_member,type,reaction) values ("+parseInt(req.body.oid)+","+req.session.uid+",'comment',2)")}
      else {conn.query("delete from other_reactions where type='comment' and reaction_on="+parseInt(req.body.oid)+" and by_member="+req.session.uid+" and reaction=2")}
      resp.end("1")
     })
  }
}



function delete_comment(req,resp)
{  
  if(!req.session.uid){resp.end()}else
  {
    conn.query("select id from users where id="+req.session.uid+" and (rank='مدير' or (select by_member from comments where id="+req.body.oid+" and  by_member="+req.session.uid+"))",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {
        conn.query("update comments set deleted=1,deleted_by="+req.session.uid+" where id="+req.body.oid,function(err,data)
        {
          if(err) throw err;
          resp.end("1");
        })
      }
    })
  }
}

function delete_user_comments(req,resp)
{
   if(!req.session.uid){resp.end()}else
   {
    conn.query("select id from users where id="+req.session.uid+" and (rank='مدير' or (select by_member from comments where id="+req.body.oid+" and  by_member="+req.session.uid+"))",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {
         var id=parseInt(req.body.oid);
         conn.query("update comments set deleted=1 where by_member="+id,function(err,data)
         {
          if(err) throw err;
          resp.end("1");
         })
      }
    })

   }

}


function render_comments(req,resp)
{   
    var from = req.body.from.trim();from=parseInt(from)*10;
    var union=" union all (select *,id,(select count(id) from other_reactions where by_member="+(req.session.uid || 0 )+" and reaction=2 and type='comment' and reaction_on=comments.id) as disliked,(select count(id) from other_reactions where by_member="+(req.session.uid || 0 )+" and reaction=1 and type='comment' and reaction_on=comments.id) as liked,(select count(id) from users where id="+(req.session.uid || 0)+" and (rank='مدير' or comments.by_member="+(req.session.uid || 0)+")) as is_owner,(select profile_photo from users where id=comments.by_member) as profile_photo,(select username from users where id=comments.by_member) as username,(select count(id) from other_reactions where type='comment' and reaction_on=comments.id and reaction=1) as likes_reactions,(select count(id) from other_reactions where type='comment' and reaction_on=comments.id and reaction=2) as dislikes_reactions from comments where deleted=0  and type="+conn.escape(req.body.type)+" and comment_on="+parseInt(req.body.oid)+" and id <"+parseInt(req.body.comment_id)+" order by add_date desc limit 15)"
    var comment_id="";if(req.body.comment_id){comment_id="where deleted=0  and type="+conn.escape(req.body.type)+" and comment_on="+parseInt(req.body.oid)+" and id="+parseInt(req.body.comment_id)+union;}else{comment_id="where deleted=0 and type="+conn.escape(req.body.type)+" and comment_on="+parseInt(req.body.oid)+" order by add_date desc limit "+from+",10"}

  
  conn.query("select *,id,(select count(id) from other_reactions where by_member="+(req.session.uid || 0 )+" and reaction=2 and type='comment' and reaction_on=comments.id) as disliked,(select count(id) from other_reactions where by_member="+(req.session.uid || 0 )+" and reaction=1 and type='comment' and reaction_on=comments.id) as liked,(select count(id) from users where id="+(req.session.uid || 0)+" and (rank='مدير' or comments.by_member="+(req.session.uid || 0)+")) as is_owner,(select profile_photo from users where id=comments.by_member) as profile_photo,(select username from users where id=comments.by_member) as username,(select count(id) from other_reactions where type='comment' and reaction_on=comments.id and reaction=1) as likes_reactions,(select count(id) from other_reactions where type='comment' and reaction_on=comments.id and reaction=2) as dislikes_reactions from comments "+comment_id,function(err,data)
  {
    if(err) throw err;
    data.forEach(function(row,index){data[index].body=Buffer.from(data[index].body,'base64').toString('utf8');if(row.profile_photo==1){data[index].profile_photo=get_photo_link("menu-profile",row.by_member)}else{data[index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
    resp.send(data);
  })


}


function submit_comment(req,resp)
{  if(!req.session.uid){resp.end();}else
  {


  var $ = cheerio.load(req.body.body);
  var tag_array=new Array();

  for(var i=0;i<$('.tag').length;i++)
  {    
       tag_array.push($(".tag").eq(i).attr("tag_to"));
       $(".tag").eq(i).attr("href","/profile/"+$(".tag").eq(i).attr("tag_to"))
       
       
  }
    var body=$("body").html();
  conn.query("insert into comments (type,body,tag_to,comment_on,by_member) values('"+req.body.type+"','"+Buffer.from(body).toString('base64')+"','"+tag_array.join(',')+"',"+conn.escape(req.body.oid)+","+req.session.uid+")",function(err,data)
  {  

    if(err) throw err;
    $(".tag").attr("id",data.insertId);;
    tag_array.forEach(function(row,index){add_notifications("tag,"+req.body.type+","+req.body.oid+","+data.insertId,row,"تمت الإشارة إليك في "+replace_comment_type(req.body.type)+" من قبل "+req.session.username,req.session.uid)})
     conn.query("update comments set body='"+Buffer.from($("body").html()).toString('base64')+"' where id="+data.insertId,function(err,updated_data)
     {
      if(err) throw err;
      conn.query("select *,id,(select count(id) from other_reactions where by_member="+(req.session.uid || 0 )+" and reaction=2 and type='comment' and reaction_on=comments.id) as disliked,(select count(id) from other_reactions where by_member="+(req.session.uid || 0 )+" and reaction=1 and type='comment' and reaction_on=comments.id) as liked,(select count(id) from users where id="+(req.session.uid || 0)+" and (rank='مدير' or comments.by_member="+(req.session.uid || 0)+")) as is_owner,(select profile_photo from users where id=comments.by_member) as profile_photo,(select username from users where id=comments.by_member) as username,(select count(id) from other_reactions where type='comment' and reaction_on=comments.id and reaction=1) as likes_reactions,(select count(id) from other_reactions where type='comment' and reaction_on=comments.id and reaction=2) as dislikes_reactions from comments where id="+data.insertId,function(err,data)
    {
      if(err) throw err;
      data.forEach(function(row,index){data[index].body=Buffer.from(data[index].body,'base64').toString('utf8');if(row.profile_photo==1){data[index].profile_photo=get_photo_link("menu-profile",row.by_member)}else{data[index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
      if(online_users.get(req.session.uid)){io.emit("new_comment",data[0]);}
      resp.send(data);
    })
     })
    
    
    
  })



}
}



function search_users(req,resp)
{
  var query=conn.escape("%"+req.body.query.trim()+"%");
  conn.query("select id,rank,username,profile_photo from users where username like "+query+" and suspend=0 limit 5",function(err,data)
  {
      if(err) throw err;
      data.forEach(function(row,index){if(row.profile_photo==1){data[index].profile_photo=get_photo_link('menu-profile',row.id)}else{data[index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
     resp.send(data);

  })
}


function user_comments(req,resp)
{
  var from =parseInt(req.body.index)*10;
  var id=parseInt(req.body.id);
  conn.query("select *,id,(select profile_photo from users where id=comments.by_member) as profile_photo,(select username from users where id=comments.by_member) as username from comments where deleted=0 and by_member="+id+"   order by add_date desc limit "+from+",10",function(err,data)
    {
      if(err){throw err};
      data.forEach(function(row,index){data[index].type=replace_comment_type(row.type);data[index].body=Buffer.from(data[index].body,'base64').toString('utf8');if(row.profile_photo==1){data[index].profile_photo=get_photo_link("menu-profile",row.by_member)}else{data[index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}})
      resp.send(data);

    })
}






function series_hint(req,resp)
{

  var id=parseInt(req.body.oid);
  var global_rank_query="select rank from (SELECT @curRank := @curRank + 1 as rank,series_name,id from (select * from series order by (select count(seen_number) from chapters where  series_number=series.id) desc) as series ,(SELECT @curRank := 0) r) as rank_table where id="+id
  conn.query("select series_profile,(select count(id) from reactions where reaction=11 and manga_number="+id+") as one_star,(select count(id) from reactions where reaction=12 and manga_number="+id+") as two_star,(select count(id) from reactions where reaction=13 and manga_number="+id+") as three_star,(select count(id) from reactions where reaction=14 and manga_number="+id+") as four_star,(select count(id) from reactions where reaction=15 and manga_number="+id+") as five_star,series_name,series_description,classifecation,(select sum(seen_number) from chapters where deleted=0 and series_number="+id+") as seen_number from series where id="+id+" and deleted=0;"+global_rank_query,function(err,data)
  {
    if(err) throw err;
    if(data[0].length==0){resp.end()}
      else
      {
     rank_obj=new Object();rank=(5*data[0][0].five_star + 4*data[0][0].four_star + 3*data[0][0].three_star + 2*data[0][0].two_star + 1*data[0][0].one_star) / (data[0][0].five_star+data[0][0].four_star+data[0][0].three_star+data[0][0].two_star+data[0][0].one_star);if(isNaN(rank)){rank=0};rank_obj.rank=rank;rank_obj.stars=getStars(rank);data[0][0].rank=rank_obj;
     if(data[0][0].series_profile==1){data[0][0].series_profile=get_photo_link("manga-profiles",id);}else{data[0][0].series_profile="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}
     resp.send(data);
      }
  })
}



function contact_modal(req,resp)
{ if(!req.session.uid){resp.end("0")}else
  { var query="select count(id) as open_session_count from contact_session where deleted=0 and status=0;";
        query+="select count(id) as my_sessions_response from contact_session where deleted=0 and status=0 and add_by="+req.session.uid+" and (select add_by from contact_session_messages where session_id=contact_session.id  order by add_date desc limit 1)<>"+req.session.uid
    conn.query(query,function(err,data)
    {
      if(err) throw err;
      resp.render("contact_modal",{data:data});
    })
    
  }
}


function session_modal(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    id=parseInt(req.body.oid);
    var query="select id,subject,status,add_by from contact_session where id="+id+" and deleted=0 and (type=0 or add_by="+req.session.uid+" or (select rank from users where id="+req.session.uid+")='مدير');select id from users where rank='مدير' and id="+req.session.uid
    conn.query(query,function(err,data)
    {
      if(err) throw err;
      if(data[0].length>0)
      {  if(data[0][0].status==0){data[0][0].status_text="مفتوحة"}else{data[0][0].status_text="مغلقة";}
       resp.render("session_modal",{data:data,myid:req.session.uid}); 
      }
      

    })
  

  }
  
}

function create_new_session(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {


  var subject=conn.escape(req.body.subject.trim());
  var message=req.body.message.trim();
  var  classefid=req.body.classefid;
  if(classefid && classefid=="on"){classefid=1}else{classefid=0}
  if(subject=="" || message==""){resp.end("بعض الحقول الضرورية فارغة")}else
  {
    query="insert into contact_session (subject,add_by,type) values("+subject+","+req.session.uid+","+classefid+")";
    conn.query(query,function(err,data)
    {
      if(err) throw err;
      message=Buffer.from(message).toString('base64');
      query="insert into contact_session_messages (add_by,body,session_id) values ("+req.session.uid+",'"+message+"',"+data.insertId+")";
      conn.query(query,function(err,data)
      {
        if(err) throw err;
        resp.end("1");
      })

    })
    
  }


  }

}



function get_sessions(req,resp)
{ if(!req.session.uid){resp.end()}else
{


  var index=parseInt(req.body.index)*5;
  var type=req.body.type;
  if(type=="private"){type="and add_by="+req.session.uid}else{type="";}
  conn.query("select id,subject,status,add_by,add_date,(select username from users where id=contact_session.add_by) as username from contact_session where deleted=0 and (type=0 or add_by="+req.session.uid+" or (select rank from users where id="+req.session.uid+")='مدير') "+type+" order by add_date desc limit "+index+",5",function(err,data)
  {
    if(err) throw err;
    data.forEach(function(row,index){if(row.status==0){data[index].status="مفتوحة"}else{data[index].status="مغلقة"}})
    resp.send(data);
  })
}
}



function session_options_form(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
  var id=parseInt(req.body.id);
  var query="";
  var close_op=req.body.close;;if(close_op && close_op=="on"){query="update contact_session set status=1,closed_by="+req.session.uid+" where deleted=0 and id="+id+" and (select rank from users where id="+req.session.uid+")='مدير'"}else{query="update contact_session set status=0  where deleted=0 and id="+id+" and (select rank from users where id="+req.session.uid+")='مدير'"}
  var delete_op=req.body.delete;if(delete_op && delete_op=="on"){query="update contact_session set deleted=1,deleted_by="+req.session.uid+" where id="+id+" and (select rank from users where id="+req.session.uid+")='مدير'"}
  var resp_code;if(delete_op && delete_op=="on"){resp_code="1"}else if(close_op && close_op=="on"){resp_code="2"}else{resp_code="3"}
  conn.query(query,function(err,data){if(err) throw err;resp.end(resp_code);})
  }
}



function get_session_messages(req,resp)
{
  if(!req.session.uid){resp.end()}else
  {
    var id=parseInt(req.body.id);
    var index=parseInt(req.body.index);
    conn.query("select id from contact_session where id="+id+" and deleted=0 and (type=0 or add_by="+req.session.uid+" or (select rank from users where id="+req.session.uid+")='مدير')",function(err,data)
    {
      if(err) throw err;
      if(data.length>0)
      {
       conn.query("select add_by,body,add_date,(select username from users where id=contact_session_messages.add_by) as username,(select profile_photo from users where id=contact_session_messages.add_by) as profile_photo from contact_session_messages where session_id="+id+" order by add_date desc limit "+index+",5",function(err,data)
       {
        if(err) throw err;
        data.forEach(function(row,index)
        {
           if(row.profile_photo==1){data[index].profile_photo=get_photo_link('menu-profile',row.add_by)}else{data[index].profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}
           data[index].body=Buffer.from(row.body,'base64').toString('utf8')
        })
        resp.send(data);
       })
      }
    })

  }
}



function session_message(req,resp)
{
  var message=req.body.message.trim();
  var id=parseInt(req.body.id);
  if(!req.session.uid){resp.end()}else
  {
      if(message==""){resp.end("بعض الحقول الضرورية فارغة")}else
      {
        message=Buffer.from(message).toString('base64');
        conn.query("select id,add_by,subject,(select add_by from contact_session_messages where session_id=contact_session.id order by add_date desc limit 1) as add_by_message from contact_session where deleted=0 and status=0 and id="+id+" and (add_by="+req.session.uid+" or (select rank from users where id="+req.session.uid+")='مدير')",function(err,data)
        {
          if(err) throw err;
          var add_by_message=data[0].add_by_message;
          var add_by_session=data[0].add_by;
          var session_subject=data[0].subject;
          if(data.length>0)
          {
            conn.query("insert into contact_session_messages (body,add_by,session_id) values ('"+message+"',"+req.session.uid+","+id+")",function(err,data)
            {
              if(err) throw err;
              conn.query("select profile_photo,rank from users where id="+req.session.uid,function(err,data)
              {
                if(err) throw err;
                var obj=new Object();
                obj.message=Buffer.from(message,'base64').toString('utf8');
                obj.username=req.session.username;
                if(data[0].profile_photo==1){obj.profile_photo=get_photo_link('menu-profile',req.session.uid)}else{obj.profile_photo="https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg"}
                obj.add_by=req.session.uid;
              if(add_by_message!=req.session.uid && data[0].rank=="مدير"){add_notifications("session_response,"+req.session.uid,add_by_session,"تم الرد على إستفسارك <span class='w_600'>"+session_subject+"</span>",id)}
                resp.send(obj);

              })
              
            })
          }
        })
      }
  }
}


function how_to_upload(req,resp){resp.render("how_to_upload")}
function privacy(req,resp){resp.render("privacy");}
function terms(req,resp){resp.render("terms");}
////////////////////////////////////////////////////////////////////////////


function reorder_pic(numbers_array,path,token,callback)
{   console.log("here")
   var chapter_folder_content=fs.readdirSync(path);

   chapter_folder_content.forEach(function(file,index)
   {
    var new_name=path+"#"+file;
    fs.rename(path+file,new_name,function()
      {
        
        
        if(chapter_folder_content.length-1==index)
    {  
      numbers_array.forEach(function(one_number,index)
      {  
        fs.renameSync(path+"#"+one_number+"-"+token+"-med.jpg",path+index+"-"+token+"-med.jpg")
        fs.renameSync(path+"#"+one_number+"-"+token+"-high.jpg",path+index+"-"+token+"-high.jpg")
        if(numbers_array.length-1==index){callback();}
      })
    }

      });
    
   })

}

function add_chapter_photo(path,quality,token,index,photo,callback)
{
  full_name=path+index+"-"+token+"-"+quality+".jpg";
  if(quality=="high"){sharp(photo).jpeg().toFile(full_name,function(err,infi){if(err) throw err;callback()})}else
  if(quality=="med"){sharp(photo).jpeg(80).toFile(full_name,function(err,infi){if(err) throw err;callback()})}
}

function sendmail(name,from,to,subject,body,callback)
{
	nodemailer.createTestAccount((err, account) => {
		if(err){callback(err)}
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
            user: "ammaramame2@gmail.com", 
            pass: "ammaramame6343258"
        }
    });



    
    let mailOptions = {
        from: '"'+name+'" <'+from+'>', 
        to: to, 
        subject: subject, 
        text: body
    };




    transporter.sendMail(mailOptions, (error, info) => {callback(error)});
});

}



function add_pic_to_chapter(pic_array,token,path,callback)
{

  if(pic_array.length==0){if (typeof callback === "function") {callback()}}else
  {
    var chapter_folder_content=fs.readdirSync(path).sort(function(a,b){return parseInt(a.substr(0,a.indexOf("-")))-parseInt(b.substr(0,a.indexOf("-")))});
    console.log(chapter_folder_content+" chapter_folder");
    var last_folder_number=parseInt(chapter_folder_content[chapter_folder_content.length-1].substr(0,chapter_folder_content[chapter_folder_content.length-1].indexOf("-")));
    console.log(last_folder_number)
    pic_array.forEach(function(file,index)
    { 
      
      add_chapter_photo(path,"med",token,(last_folder_number+index+1),file.path,function()
    {
      add_chapter_photo(path,"high",token,(last_folder_number+index+1),file.path,function(){if(pic_array.length-1==index){callback()}})
    })
      
    })
  }

}

function remove_pic_not_in_array(numbers_array,path,callback)
{  
    
    var chapter_folder_content=fs.readdirSync(path);
    chapter_folder_content.forEach(function(file_name,index)
  { 
    pic_number=file_name.substr(0,file_name.indexOf("-"))
    if(numbers_array.indexOf(pic_number)==-1){if(fs.existsSync(path+file_name)){;fs.unlink(path+file_name,function(){});};}
    if(chapter_folder_content.length-1==index){callback();}
    

  })

  
  
}




function get_photo_link(type,data,insert=false)
{   var link=""
    var insert_op="";
    if(insert){insert_op=__dirname}
    if(type=="manga-profiles"){link=insert_op+"/profiles/"+data+"-manga-profiles.jpg";return link;}
    if(type=="menu-profile"){link=insert_op+"/profiles/"+data+"-menu-profile.jpg";return link;}
    if(type=="team-profile"){link=insert_op+"/profiles/"+data+"-team-profile.jpg";return link;}
    if(type=="team-wallpaper"){link=insert_op+"/profiles/"+data+"-team-wallpaper.jpg";return link;}
    if(type=="manga-wallpaper"){link=insert_op+"/profiles/"+data+"-manga-wallpaper.jpg";return link;}
    if(type=="news-wallpaper"){link=insert_op+"/profiles/"+data+"-news-wallpaper.jpg";return link;}
    
}


function getStars(rating) {

  // Round to nearest half
  rating = Math.round(rating * 2) / 2;
  let output = [];

  // Append all the filled whole stars
  for (var i = rating; i >= 1; i--)
    output.push('<i class="fas fa-star"></i>');

  // If there is a half a star, append it
  if (i == .5) output.push('<i class="fas fa-star-half-alt"></i>');

  // Fill the empty stars
  for (let i = (5 - rating); i >= 1; i--)
    output.push('<i class="far fa-star"></i>');
   output.reverse();
  return output.join('');

}



function chapters(condition="",callback)
{  if(condition!="")
      {
      	condition=" and "+condition;
      }
	conn.query("select * from chapters where deleted=0"+condition,function(err,data)
	{
		if(err) throw err;
		callback(data);
	})
}





// define function remove item from array
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};



// define function get unqie values from array
Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.includes(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}



var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};




function pagination(c, m) {
    var current = c,
        last = m,
        delta = 2,
        left = current - delta,
        right = current + delta + 1,
        range = [],
        rangeWithDots = [],
        l;

    for (let i = 1; i <= last; i++) {
        if (i == 1 || i == last || i >= left && i < right) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
}



function get_activity(id,callback)
{   
    conn.query("select process,process_on,(select username from users where id=activity.proccess_by) as proccess_by from activity where id="+id,function(err,proc){

        if(err) throw err;
    
        var process_number=proc[0].process;
        var process_on_number=proc[0].process_on;
        var by=proc[0].proccess_by;
        var response="";
        if(process_number==1){conn.query("select chapter_number,(select series_name from series where id=chapters.series_number) as series_name from chapters where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بإضافة الفصل "+element[0].chapter_number+" لسلسلة "+element[0].series_name;callback(response)})}
        else if(process_number==2){conn.query("select chapter_number,(select series_name from series where id=chapters.series_number) as series_name from chapters where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بتعديل الفصل "+element[0].chapter_number+" لسلسلة "+element[0].series_name;callback(response)})}
        else if(process_number==3){{conn.query("select chapter_number,(select series_name from series where id=chapters.series_number) as series_name from chapters where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بحذف الفصل "+element[0].chapter_number+" لسلسلة "+element[0].series_name;callback(response)})}}
        else if(process_number==4){conn.query("select series_name from series where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بإضافة سلسلة "+element[0].series_name;callback(response)})}
        else if(process_number==5){conn.query("select series_name from series where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بتعديل سلسلة "+element[0].series_name;callback(response)})}
        else if(process_number==6){conn.query("select series_name from series where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بإخفاء سلسلة "+element[0].series_name;callback(response)})}
        else if(process_number==7){conn.query("select username from users where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بالإنضمام للموقع";callback(response)})}
        else if(process_number==8){conn.query("select username from users where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بتعديل بيانات المستخدم "+element[0].username;callback(response)})}
        else if(process_number==9){conn.query("select team_name from teams where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بقبول فريق "+element[0].team_name;callback(response);})}
        else if(process_number==10){conn.query("select team_name from teams where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بتعديل بيانات فريق "+element[0].team_name;callback(response);})}
        else if(process_number==11){conn.query("select chapter_number,(select series_name from series where id=chapters.series_number) as series_name from chapters where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بإسترجاع الفصل "+element[0].chapter_number+" لسلسلة "+element[0].series_name;callback(response)})}
        else if(process_number==12){conn.query("select series_name from series where id="+process_on_number,function(err,element){if(err) throw err;response="قام "+by+" بإسترجاع سلسلة "+element[0].series_name;callback(response)})}
        
    })
}



function set_activity(number,by,on)
{

conn.query("insert into activity (process,proccess_by,process_on) values("+number+","+by+","+on+")",function(err,data)
{ 
  if(err) throw err;
})

}



function add_notifications(type,to,data,link_id){emit_message_to_socket("notifications",data,parseInt(to),"إشعار جديد",0);conn.query("insert into notifications (type,to_number,notification_data,link_id) values('"+type+"',"+to+","+conn.escape(data)+","+conn.escape(link_id)+")");}



function emit_message_to_socket(type,message,to,from,from_id)
{   
   if(online_users.get(to))
   {
    obj=new Object();
    obj.from=from;
    obj.from_id=from_id
    obj.message=message;

    online_users.get(to).emit(type,obj)
    }
}


function replace_comment_type(type)
{
  if(type=="series"){return "سلسلة"}else
  if(type=="chapter"){return "فصل"}else
  if(type=="new"){return "خبر"}else{return "غير معروف"}
}





function array_element_counter(element)
{
  var coun
}



Array.prototype.element_counter = function(element)
{
  var counter=0;
  this.forEach(function(aelement,index)
  {
    if(element==aelement)counter++;

  })
  return counter;
}