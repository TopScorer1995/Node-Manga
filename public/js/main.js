var contact_modal=0;
var profile_modal=0;
var news_modal=0;
var confirmed_function;
var button_sound = new Howl({src: ['/sounds/5.mp3']});
     
let socket = io('/', { forceNew: true });
    socket.on('message', function(msg){$(".messages_trigger").addClass("have_social");toastr["info"](msg.message,"رسالة جديدة من "+msg.from)});
    socket.on("reload",function(msg){location.reload()})
    socket.on('notifications', function(msg){$("#notifcation_trigger").addClass("have_social");toastr["info"](msg.message,msg.from)});
$(document).ready(function()
{   if(Cookies.get('skin')){skin(Cookies.get('skin'));}
	$("#signup_footer_button").click(function(){$("#login_button").click();$("#signup_tab_button").click()})
	 $(".sticky").sticky({ topSpacing: 80,zIndex: 2, stopper: "#main_footer",startScrolling :"bottom"});
	 $('.mdb-select').materialSelect();
	 $('.modal').on('show.bs.modal', function (e) {$("body").addClass("overflow_hidden");})
     $('.modal').on('hide.bs.modal', function (e) {$("body").removeClass("overflow_hidden");})
     $(function (){$('[data-toggle="tooltip"]').tooltip()})
     $('#dtBasicExample').DataTable();
     $('.dataTables_length').addClass('bs-select');
     $(document).on("click",".prevent-close",function(e){e.stopPropagation();});
     $(document).on("change","#team_panned_checkbox",function(){if($(this).is(":checked")){$("#team_panned_textarea").removeClass("hide");$("#team_panned_textarea").find("textarea").focus()}else{$("#team_panned_textarea").addClass("hide")}})
     $(document).on("click",".profile_menu_trigger",function(){if(profile_modal==0){;$.post("/profile_menu",render_profile_modal)}})
     $(document).on("click","#notifcation_trigger",function(){$.post("/notifcation_menu",render_notifcation_menu)})
     $(document).on("click",".realase_trigger",function(){$("#realase_modal").remove();$.post("/last_relesase",{},handle_last_relesase)})
     $(document).on("keyup",".search_box",function(){var trigger=$(this);trigger.addClass("rounded_loader");var word=$(this).val();if(word.trim()!="")delay(function(){$.post("/search_data",{word:word},function (data){menu=trigger.parent().find("ul");menu.html("");menu.append('<span class="badge badge-info py-2">سلاسل</span>');;data.manga.forEach(function(manga,index){menu.append('<li onclick="location.href=\'/manga/'+manga.id+'\'" class="list-group-item  p-0  border-0"><div class="chip chip-md  white-text waves-effect waves-effect w-100 m-0 rounded-0 one_search_result"><img class="rounded-0" src="'+manga.series_profile+'" alt=""><div class="d-inline-block float-left h-100 search_box_body_width">'+manga.series_name+'</div><div class="d-inline float-right"><span class="badge badge-danger ml-auto">'+manga.chapter_count+'</span></div></div></li>')});menu.append('<span class="badge badge-info py-2">مجموعات</span>');;data.teams.forEach(function(team,index){menu.append('<li class="list-group-item  p-0  border-0" onclick="location.href=\'/team/'+team.id+'\'"><div class="chip chip-md  white-text waves-effect waves-effect w-100 m-0 rounded-0 one_search_result"><img class="rounded-0" src="'+team.team_profile+'" alt=""><div class="d-inline-block float-left h-100 search_box_body_width">'+team.team_name+'</div><div class="d-inline float-right"><span class="badge badge-danger ml-auto">'+team.chapter_count+'</span></div></div></li>')});menu.append('<span class="badge badge-info py-2">مستخدمين</span>');;data.users.forEach(function(user,index){menu.append('<li class="list-group-item  p-0  border-0" onclick="location.href=\'/profile/'+user.id+'\'"><div class="chip chip-md  white-text waves-effect waves-effect w-100 m-0 rounded-0 one_search_result"><img class="rounded-0" src="'+user.profile_photo+'" alt=""><div class="d-inline-block float-left h-100 search_box_body_width">'+user.username+'</div><div class="d-inline float-right"><span class="badge badge-danger ml-auto">'+user.reaction_count+'</span></div></div></li>')});trigger.removeClass("rounded_loader");if($(trigger).parent().children(".dropdown-menu").is(":hidden")){trigger.click();}});},1000)})
     $(document).on("click",".attach_trigger",function(){$.post("/attach_modal",handle_attach_modal)})
     $(document).on("click","#confirm_function_button",function(){confirmed_function()})
     $(document).on("click",".messages_trigger",function(){get_messages_modal()})
     $(document).on("click","#more_reading_now",function(){$("#realase_modal").remove();$.post("/last_relesase",{reading_now:1},handle_last_relesase)})
     $(document).on("click",".btn,.btn-primary,.btn-secondary,.btn-success,.btn-danger,.btn-warning,.btn-info,.btn-light,.btn-dark,.btn-link",function(){;button_sound.play();})
     $(document).on("mouseover",".series_hint",function(e){var trigger=$(this);$.post("/series_hint",{oid:trigger.attr("oid")},function(data){$(".series_hint_temp").remove();var temp='<div  class="bg-white animated fadeIn position-absolute text-right row rtl p-2 series_hint_temp" style="top:'+(e.pageY+10)+'px;left:'+e.pageX+'px;width:400px;z-index:1000"><div class="col-4 p-0"><img src="'+data[0][0].series_profile+'" style="width:100% !important;max-height:155px !important;object-fit: cover;"></div><div class="col-8"><div class="w_600" style="font-size:18px">'+data[0][0].series_name+'</div><div class="f13 mt-2"><span class="text-info">التقييم </span><span class="text-warning">'+data[0][0].rank.stars+'</span><span class="mx-2">'+data[0][0].rank.rank+'</span></div><div class="f13 mt-1 no_overflow"><span class="text-info">المشاهدات </span><span>'+(data[0][0].seen_number || 0)+'</span></div><div class="mt-1 f13 no_overflow"><span class="text-info">الترتيب </span><span>'+data[1][0].rank+'</span></div><div class="mt-1 f13 no_overflow"><span class="text-info">التصنيفات </span><span class="f10">'+data[0][0].classifecation+'</span></div><div class="f13 mt-1"><span class="text-info">الوصف </span><span class="f10">'+data[0][0].series_description+'</span></div></div></div>';$("body").append(temp)})});
     $(document).on("mouseout",".series_hint",function(){waitForEl(".series_hint_temp",function(){;$(".series_hint_temp").remove()})})
     $(".popover").popover();

setInterval(set_when, 60000);

  



     // time ago over ride
        
      (function() {
  function numpf(num, w, x, y, z) {
    if( num == 0 ) {
      return w;
    } else if( num == 2 ) {
      return x;
    } else if( num >= 3 && num <= 10) {
      return y; // 3:10
    } else {
      return z; // 11+
    }
  }
  jQuery.timeago.settings.strings = {
    prefixAgo: "منذ",
    prefixFromNow: "يتبقى",
    suffixAgo: null,
    suffixFromNow: "الأن", // null OR "من الآن"
    seconds: function(value) { return numpf(value, "لحظات", "ثانيتين", "%d ثواني", "%d ثانيه"); },
    minute: "دقيقة",
    minutes: function(value) { return numpf(value, null, "دقيقتين", "%d دقائق", "%d دقيقة"); },
    hour: "ساعة",
    hours: function(value) { return numpf(value, null, "ساعتين", "%d ساعات", "%d ساعة"); },
    day: "يوم",
    days: function(value) { return numpf(value, null, "يومين", "%d أيام", "%d يوم"); },
    month: "شهر",
    months: function(value) { return numpf(value, null, "شهرين", "%d أشهر", "%d شهر"); },
    year: "سنه",
    years: function(value) { return numpf(value, null, "سنتين", "%d سنوات", "%d سنه"); }
  };
})();

     // /time ago over ride
    /* 
     // ad blocker test
     var adBlockEnabled = false;
     var testAd = document.createElement('div');
     testAd.innerHTML = '&nbsp;';
     testAd.className = 'adsbox';
     document.body.appendChild(testAd);
     window.setTimeout(function() {
     if (testAd.offsetHeight === 0) {
     adBlockEnabled = true;
      }
     testAd.remove();
     if(adBlockEnabled){append_ad_label()}else {remove_ad_label()}
     }, 300);
     // / ad blocker test 
     */




     $(document).on("click",".contact_modal_trigger",function(){if(contact_modal==0){$.post("/contact_modal",{},render_contact_modal)}});
     toastr.options = {"positionClass": "toast-bottom-right"}

      



    


})

function animateCss(element, animationName, callback) {const node = document.querySelector(element);node.classList.add('animated', animationName);function handleAnimationEnd() {node.classList.remove('animated', animationName);node.removeEventListener('animationend', handleAnimationEnd);if (typeof callback === 'function') callback()}node.addEventListener('animationend', handleAnimationEnd)}



function skin(skin){$("body").attr("class","");$("body").attr("class",skin);Cookies.set('skin',skin);}
function append_ad_label(){$(".body").prepend('<div id="main_a_d_label" class="alert alert-warning text-right rtl d-block w-100" role="alert"><i class="fas fa-exclamation-triangle"></i> الإعلانات تساعدنا على البقاء لتقديم الخدمات للمستخدمين لمساعدتنا الرجاء إغلاق مانع الإعلانات</div>')}
function remove_ad_label (){$("#main_a_d_label").remove();}
function render_contact_modal(data){if(data==0){toastr.error("يجب تسجيل الدخول أولا")}else{$("#modal_contact_form").remove();$("body").append(data);;$("#modal_contact_form").modal("show");}}
function render_profile_modal(data){profile_modal=1;$(".profile_menu_continer").append(data);$("#login_modal").modal("show");$(".profile_button").remove();$(".profile_menu_trigger").click();}
function render_notifcation_menu(data){$(".notifcation_continer").append(data);$("#notifcation_trigger").remove();$(".notifcation_menu_trigger").click();}
function handle_last_relesase(data){$("body").append(data);$("#realase_modal").modal("show");}
function handle_attach_modal(data){$("body").append(data);$("#attach_modal").modal("show");$(".attach_trigger").removeClass("attach_trigger")}
function get_report_modal(type,id){$("#report_modal").remove();$.post("/report_modal",{type:type,oid:id},function(data){if(data==0){toastr.error("يجب تسجيل الدخول أولا")}else{$("body").append(data);$("#report_modal").modal("show")}})}
function get_user_edit_modal(id){$("#edit_user_modal").remove();$.post("/edit_user_modal",{uid:id},function(data){$("body").append(data);$("#edit_user_modal").modal("show")})}
function get_team_modal(id){$("#edit_team_modal").remove();$.post("/edit_team_modal",{uid:id},function(data){$("body").append(data);$("#edit_team_modal").modal("show")})}
function get_series_modal(id){$("#edit_series_modal").remove();$.post("/edit_series_modal",{uid:id},function(data){$("body").append(data);$("#edit_series_modal").modal("show")})}
function delete_series(id){$.post("/delete_series",{id:id},function(data){if(data==1){location.reload()}})}
function restore_series(id){$.post("/restore_series",{id:id},function(data){if(data==1){location.reload()}})}
function get_chapter_modal(id){$("#edit_chapter_modeal").remove();$.post("/edit_chapter_modeal",{uid:id},function(data){$("body").append(data);$("#edit_chapter_modeal").modal("show")})}
function get_messages_modal(){$("#messages_modal").remove();$.post("/messages",function(data){$("body").append(data);$("#messages_modal").modal("show")})}
function get_news_modal(id){if(news_modal==0){$("#write_new_modal").remove();$.post("/get_add_news_modal",function(data){$("body").append(data);$("#write_new_modal").modal("show");news_modal=1})}}
function get_chat_box(id){$("#chat_box").remove();$.post("/chat_box",{id:id},function(data){if(data==0){toastr.error("يجب تسجيل الدخول أولا")}else{$("body").append(data);$("#chat_box").modal("show")}})}
function agree(id,type){$.post("/agree",{oid:id,type:type},function(data){if(data==1){toastr.success("تمت الموافقة بنجاح")}})}
function get_session_modal(id){$("#session_modal").remove();$.post("/session_modal",{oid:id},function(data){$("body").append(data);$("#session_modal").modal("show")})}
function delete_chapter(id){$.post("/delete_chapter",{id:id},function(data){if(data==1){location.reload("1")}})}
function restore_chapter(id){$.post("/restore_chapter",{id:id},function(data){if(data==1){location.reload("1")}})}
function comment_system(selector,type,oid,comment_tag_id){var comment_id;if(typeof comment_tag_id=="number"){comment_id=comment_tag_id}$.post("/comment_system",{type:type,oid:oid,comment_id},function(data){$(selector).html(data)})}
function team_member_options(type,id,value){$.post("/team_member_options",{type:type,id:id,value:value},function(data){if(data==1){toastr.success("تم تنفيذ العملية بنجاح")}else{toastr.error("حجم البيانات أكبر من اللازم")}})}
function ask_to_confirm(func){confirmed_function=func;$("#confirm_modal").remove();$("body").append('<div class="modal fade center" id="confirm_modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalPreviewLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-body rtl text-right f12">هل أنت متأكد من القيام بهذا الإجراء</div><div class="modal-footer"><button type="button" class="btn btn-secondary py-2" data-dismiss="modal">لا</button><button type="button" class="btn btn-primary py-2" data-dismiss="modal" id="confirm_function_button">نعم</button></div></div></div></div>');$("#confirm_modal").modal("show")}
function show_class(type){location.href="/library?class_query="+type}
function set_when(){ var dom=$(".time_ago_dom");;for(var i=0;i<dom.length;i++){dom.eq(i).html(jQuery.timeago(new Date(dom.eq(i).attr("when"))))} }
var waitForEl = function(selector, callback) {if (jQuery(selector).length) {callback();} else {setTimeout(function(){waitForEl(selector, callback);}, 100);}};
var delay = (function(){var timer = 0;return function(callback, ms){clearTimeout (timer);timer = setTimeout(callback, ms)}})()