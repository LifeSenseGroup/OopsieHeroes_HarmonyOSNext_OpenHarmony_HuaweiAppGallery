<script lang="ts">
  import { _ } from "svelte-i18n";
  import { locale, locales } from "svelte-i18n";
  import { onMount, onDestroy } from "svelte";
  import {push, pop} from 'svelte-spa-router';
  import {store_smallOrLargeImageTxt} from '../stores';
  
  var myScreenOrientation = window.screen.orientation;
 
  try {
  myScreenOrientation.lock("portrait"); // prevent from rotating screen
  } catch (error) {
  console.error(error);
  }

  console.log("loading")


  onMount( 
    () => {
    console.log("mounted")
  });

  onDestroy(() => {
    try {
      myScreenOrientation.unlock(); // screen might be rotated again
    } catch (error) {
      console.error(error);
    }
   });
</script>


<style>
.text-with-margin {
    margin-left: 80px;
    margin-right: 80px; 
  }

  .navy-blue-text {
    color: navy;
  }

  .unbold-text {
    font-weight: normal; 
  }

  #scrollable-content {
    overflow: auto; /* Add a vertical scrollbar if content overflows */
    max-height: 900px; /* Set a maximum height for the container; adjust as needed */
  }

  
  .oblique {
  font-style: oblique;
}

.Arrow {
  grid-area: Arrow;
  
}

</style>

<div id="scrollable-content">
  <div class="Arrow center">
    <button class="button" on:click={() => pop()}> 
    <img  style="width:3vw;" src="build/images/Arrow_icon.svg"  alt="back arrow" width=100%> 
    </button>  
  </div>

  <div class="Margin" style = "font-family: Arial;">
  {#if $locale === 'zh-CN' || $locale === 'zh-TW'}
  <h1 class="text-with-margin navy-blue-text">隐私政策</h1>
  <h2 class="text-with-margin">LifeSense Group 隐私政策</h2>
  {:else}
  <h1 class="text-with-margin navy-blue-text">PRIVACY POLICY</h1>
  <h2 class="text-with-margin">LifeSense Group Privacy Policy</h2>
  {/if}
  <h3 class="text-with-margin unbold-text oblique">(Last updated 02.07.2019) </h3>
  {#if $locale === 'zh-CN' || $locale === 'zh-TW'}
  <h3 class="text-with-margin unbold-text">LifeSense Group 相信，可穿戴技术能够帮助人们独立了解并改善自身健康。我们深知保护敏感数据（例如尿液渗漏信息）责任重大，并致力于以最高标准保护隐私和安全，透明地说明我们如何处理数据。</h3>
  <h3 class="text-with-margin unbold-text">如对本政策有任何疑问，请联系 info@oopsieheroes.com。LifeSense Group 地址：High Tech Campus 32, 5656AE, Eindhoven, The Netherlands。数据保护负责人可通过上述邮箱联系。</h3>

  <h3 class="text-with-margin">1. 我们如何处理您的个人数据</h3>
  <h3 class="text-with-margin unbold-text">当您使用 LifeSense Group 的服务（例如 Oopsie Heroes、Carin Pelvic Floor Trainer 等应用或我们的网站）时，我们会使用内部工具及第三方工具收集、存储和分析部分个人数据及非个人数据。</h3>
  <h3 class="text-with-margin oblique">1.1 了解您的需求并改进服务</h3>
  <h3 class="text-with-margin unbold-text">无论您是否注册账户，使用我们的应用或网站时，我们都会处理部分数据，以了解您如何使用产品、分析并修复问题，以及改进功能和服务。用于此目的的数据不包括可直接识别您身份的个人信息（如姓名、电子邮件）或健康数据。我们可能收集设备型号、名称和标识符、设备及应用设置、崩溃信息、浏览器和操作系统信息、应用事件和使用情况，以及用于提供服务和估算大致位置的 IP 地址。我们会尽量减少收集的数据。若您不同意，可停止使用服务、删除账户并卸载应用。</h3>
  <h3 class="text-with-margin oblique">1.2 提供个性化健康服务</h3>
  <h3 class="text-with-margin unbold-text">您在 LifeSense Group 应用中记录的健康和活动数据属于敏感个人数据。只有在您创建账户并明确同意后，我们才会将这些数据与创建账户所需的个人信息一起存储在安全服务器上。账户资料可能包括姓名和电子邮件地址；健康数据可能包括年龄、性别以及过往和当前尿液渗漏事件的日期。麦克风音频仅用于识别 Oopsie Heroes 传感器信号，不会保存。您可以随时删除账户撤回同意；之后仍可不登录账户使用应用，数据仅存储在您的设备上。请定期备份，以免数据丢失。</h3>
  <h3 class="text-with-margin oblique">1.3 推进尿液渗漏相关科学研究</h3>
  <h3 class="text-with-margin unbold-text">LifeSense Group 致力于运用可穿戴技术改善健康，并与学术研究人员合作。我们谨慎选择研究合作方；只有在按照严格流程删除可用于识别个人的信息并完成匿名化后，才会提供研究数据。我们努力以易于理解的方式发布研究成果。您可随时删除账户，撤回将数据用于未来研究合作的同意。</h3>

  <h3 class="text-with-margin">2. 您对处理健康及敏感数据的同意</h3>
  <h3 class="text-with-margin unbold-text">创建 LifeSense Group 应用账户后，您的个人数据（包括健康和敏感数据）会保存在您的设备上，并由 LifeSense Group 服务器存储和处理，以便提供数据备份及其他功能。创建账户即表示您明确同意：LifeSense Group 为向您提供服务及改进功能而处理您提供的数据，包括通过应用或您提供的电子邮件地址发送信息和提醒；账户资料可能包括您输入的姓名、电子邮件地址、年龄和性别；尿液渗漏数据可在匿名化后用于学术和临床研究，且匿名数据无法与您个人关联。您可随时删除账户撤回同意。删除账户后仍可继续使用应用，但服务器不再保存您的数据；无账户用户丢失的数据无法恢复，请定期备份。</h3>

  <h3 class="text-with-margin">3. 您的权利</h3>
  <h3 class="text-with-margin unbold-text">隐私（包括数据隐私）是一项基本权利。我们尽量减少个人数据的使用，只为本政策所述目的处理数据，并定期请专家检查服务器安全。我们不会以可识别身份的形式保留超过提供服务所需期限的数据，也不会进行自动化决策或用户画像。您可以请求查询我们处理的个人数据、以可供其他组织读取的格式获取数据副本、更正应用中的个人资料和健康数据、通过删除账户或取消订阅撤回同意、请求删除数据（包括此前发送给用于追踪和分析的第三方的数据；请联系 info@oopsieheroes.com，删除将在 30 天内完成），或向相关监管机构提出投诉。</h3>

  <h3 class="text-with-margin">4. 数据安全</h3>
  <h3 class="text-with-margin unbold-text">我们采取安全措施，防止受我们控制的个人信息遭到滥用、丢失或更改，并遵循行业最佳实践传输和存储数据。尽管无法保证这些情况绝不会发生，我们会采取合理措施予以防范。</h3>
  <h3 class="text-with-margin oblique">4.1 我们如何存储您的个人数据</h3>
  <h3 class="text-with-margin unbold-text">账户个人资料与尿液渗漏记录及服务设置分开存储，以保护您的隐私。密码在相关功能实施后将通过单向加密（哈希和加盐）存储，我们无法读取。LifeSense Group 使用位于欧盟的服务器处理和存储个人数据。您的设备与服务器之间使用 HTTPS 加密传输。</h3>
  <h3 class="text-with-margin oblique">4.2 保护数据的建议</h3>
  <h3 class="text-with-margin unbold-text">如果他人取得您设备的访问权限，您的数据可能面临风险。请为设备启用 PIN、Touch ID 或 Face ID，并设置设备丢失或被盗时远程锁定或抹除数据的功能。iOS 用户可使用 iCloud 中的“查找我的 iPhone”和抹除设备功能；Android 用户可使用 Google 的“查找我的设备”。未注册账户时，所有数据仅保存在设备上；卸载应用或丢失设备可能导致数据丢失，请定期备份。iOS 用户可通过 iTunes 或 iCloud 备份。</h3>

  <h3 class="text-with-margin">5. 向欧盟以外地区及第三方应用传输数据</h3>
  <h3 class="text-with-margin unbold-text">向欧盟或欧洲经济区（EEA）以外国家传输个人数据时，接收地须遵守适用的隐私规定，并确保您的隐私权受到保护。</h3>
  <h3 class="text-with-margin">6. Cookie 和追踪</h3>
  <h3 class="text-with-margin unbold-text">我们的网站使用 Cookie（一种小型文本文件）来改善使用体验、保存偏好设置并支持分析服务（例如 Google Analytics）。您可以在浏览器中禁用 Cookie。应用和网站也可能使用第三方分析与追踪服务，以了解服务使用情况并改善安全性。LifeSense Group 或受托第三方可能使用分配给您的唯一标识符处理使用信息；在不再需要这些信息时会予以删除，向第三方分享前会进行匿名化（第 6.2 节所述情况除外）。</h3>
  <h3 class="text-with-margin oblique">6.1 对追踪和分析的同意</h3>
  <h3 class="text-with-margin unbold-text">使用应用或网站即表示您同意 LifeSense Group 为追踪、分析和改进服务而使用 Cookie、第三方服务及唯一标识符。您可通过禁用设备上的 Cookie，或按照各第三方提供商的说明分别撤回同意。</h3>
  <h3 class="text-with-margin oblique">6.2 Google Analytics</h3>
  <h3 class="text-with-margin unbold-text">我们的网站使用 Google Inc.（“Google”）运营的 Google Analytics。该服务使用存储在您设备上的 Cookie 分析网站访问和互动情况，相关信息会传输并存储在 Google 位于美国的服务器上。Google 使用这些信息向 LifeSense Group 提供网站及相关服务使用报告，也可能在法律要求或委托处理数据时向第三方传输信息。Google 不会将您的 IP 地址与其他个人数据关联。您可通过更改浏览器设置阻止 Cookie，但部分网站功能可能因此受到影响。使用网站即表示您同意 Google 按上述方式处理非个人数据；撤回同意仅对未来处理有效。</h3>
  <h3 class="text-with-margin oblique">6.3</h3>
  <h3 class="text-with-margin unbold-text">上述公司遵守欧盟—美国隐私保护框架。相关服务的隐私政策可在各服务的网站查阅。</h3>
  <h3 class="text-with-margin">7. 通信和新闻通讯</h3>
  <h3 class="text-with-margin unbold-text">LifeSense Group 可能使用您的个人信息（例如电子邮件地址）发送消息、电子邮件、推送通知、应用内消息、健康信息及不定期的推广内容。仅当您订阅新闻通讯或同意接收通知时，我们才会提供这些服务。您可通过邮件底部的退订链接取消订阅，并可在设备设置中关闭通知。为提供这些服务，我们可能将电子邮件地址等信息交给第三方服务商处理，包括位于美国亚特兰大的 Rocket Science Group LLC（“MailChimp”），用于发送信息及偶尔的商业内容。相关服务的隐私政策可在其网站查阅。</h3>
  <h3 class="text-with-margin">8. 本隐私政策的变更</h3>
  <h3 class="text-with-margin unbold-text">LifeSense Group 可能因法律、数据收集和使用方式、服务功能或技术发展而不时修订本政策。请定期查看此页面。如我们认为重大变更会影响您，将在本政策中发布通知。</h3>
  <h3 class="text-with-margin unbold-text oblique">如您对本政策有疑问，请联系 info@oopsieheroes.com。</h3>
  <h3 class="text-with-margin unbold-text">©2019 LifeSense Group B.V.</h3>
  {:else}
    <h3 class="text-with-margin unbold-text">
   At LifeSense Group, we believe that wearable technology empowers people to understand and work on their health independently. We fully acknowledge the great responsibility that comes with safeguarding sensitive data, such as information about your urine loss. We are committed to achieving the highest standards of privacy and security, as well as to being transparent about how we process data.</h3>
   <h3 class="text-with-margin unbold-text"> We hope you will find this privacy policy clear, honest, and transparent. Do not hesitate to reach out to us at info@oopsieheroes.com if you have any questions.</h3>
   <h3 class="text-with-margin unbold-text"> LifeSense Group contact address is High Tech Campus 32, 5656AE, Eindhoven, The Netherlands. Further contact information can be found here. LifeSense Group has an appointed data protection officer, who can be contacted at info@oopsieheroes.com.</h3>
   <br>
   <h3 class="text-with-margin"> 1. How we process your personal data at LifeSense Group </h3>
   <h3 class="text-with-margin unbold-text"> Data processing is at the center of everything we do at LifeSense Group, and whenever you use our services—e.g. when you use the LifeSense Group products apps (like Oopsie Heroes or Carin Pelvic Floor Trainer) or when you go on our website—some personal and non-personal data is collected, stored, and analyzed using internal and third-party tools. </h3>

   <h3 class="text-with-margin unbold-text"> Here are the three purposes for which we process data and the type of data that is processed to fulfill each purpose:</h3>
   <br>
   <h3 class="text-with-margin oblique"> 1.1 To understand your needs and improve our services</h3>

   <h3 class="text-with-margin unbold-text"> When you use our apps—including use without an account—or when you go on our website LifeSense Group collects, stores, and uses some personal and non-personal data and transmits it to some third-party services.</h3>
   <h3 class="text-with-margin unbold-text">  We do this in order to understand your needs and your use of our products, to analyze bugs and fix issues, and to bring you more useful features. In a nutshell, we process this data to provide you the best and most reliable experience of our services. We do not process personal data that directly identifies you as a person (such as your first name, surname, email) or health-related data.</h3>
  
   <h3 class="text-with-margin unbold-text"> Here are the types of data we collect:</h3>

    <h3 class="text-with-margin">Device data <span class="unbold-text"> This data informs us about the device you use to access our services, such as the model, name and identifiers, device settings, the application identifier, and crash information. On our website, we collect information about your browser and browser settings, the operating system you use, and the system settings of your device.</span>
    </h3>
    <h3 class="text-with-margin">Event and usage data <span class="unbold-text"> When you use the apps or when you go to our website, our servers process data in order to understand your usage of our services—for example, which pages you visit or which tab in the app you open. We collect this information and use it as aggregate data to better understand which features are the most relevant or useful to our users as whole.</span>
    </h3>

    <h3 class="text-with-margin">IP address <span class="unbold-text"> We collect IP addresses provided by your browser or mobile device to deliver the service to your device. We also use the IP address to determine your approximate location for statistical and analytics purposes. </span>
    </h3>
    <h3 class="text-with-margin unbold-text"> All the data we collect at LifeSense Group is necessary for LifeSense Group to deliver the services you use. The amount we collect has been minimized wherever possible to respect your privacy.</h3>
    <h3 class="text-with-margin unbold-text"> Should you still disagree with the collection and processing of this data, we recommend you stop using our services or delete your account and uninstall the app.</h3>
    <h3 class="text-with-margin oblique"> 1.2 To deliver personalized insights as your trusted health companion </h3>  
    <h3 class="text-with-margin unbold-text"> The data you track in LifeSense Group apps about your health and activities is considered sensitive personal data. LifeSense Group does not store sensitive personal data without your explicit permission. It is only when you give us explicit consent by creating a LifeSense Group account that we start storing all your health and sensitive data on our secured servers, alongside the personal data necessary to create an account. You can find a detailed explanation of what you consent to when creating an account with LifeSense Group in the next section of our Privacy Policy.</h3>
    <h3 class="text-with-margin unbold-text">You can withdraw your consent at any time by simply deleting your account in the app, newsletter, etc. In this case, you can still use our apps without an account and your data will only be stored locally on your device. All future data will be only stored in your smartphone, so be sure to make regular backups to avoid the loss of your data.</h3>
    <h3 class="text-with-margin unbold-text">Here is the type of data we collect and store when you create an account:</h3> 
    <h3 class="text-with-margin">Personal data used for account creation <span class="unbold-text">We need some of your personal data, such as your name, surname, and email address, in order to create your account.</span></h3>
    <h3 class="text-with-margin">Health and sensitive data <span class="unbold-text">We store health data, such as your age, gender and dates of your past and current urine loss events. LifeSense Group uses this data for the purpose of providing our services to you.</span></h3>
  
    <h3 class="text-with-margin">Microphone <span class="unbold-text">We record (but don’t save) microphone audio from the mobile device to be able to detect the signal from the Oopsie Heroes sensor. The data is directly processed and is not saved anywhere.</span></h3>
    <h3 class="text-with-margin oblique"> 1.3 To advance scientific research about urine loss </h3>  
  
    <h3 class="text-with-margin unbold-text"> The vision of LifeSense Group is: seek to inspire a healthier life for everyone, everyday. LifeSense aims to empower people everyday by revolutionizing healthcare with wearable technology. Since its inception, LifeSense Group has successfully collaborated with academic researchers. <br> <br> We want to make it very clear that we personally select our scientific collaborators with the utmost care and, most importantly, that we only provide data for scientific research after it has been anonymized following a strict protocol that involves the removal of any information that could be used to identify any specific user.
      <br> <br>
      Finally, because we believe that research should benefit everyone, LifeSense Group strives to publish the results of our academic, clinical, or internal research in ways that are easy to read for all our users.
      <br> <br>
      Once again, you can withdraw your consent to use of your data for these purposes at any time by deleting your account. If you do this, your data won’t be included in any future research partnerships.
    </h3>

    <h3 class="text-with-margin">2. Your consent for processing health and sensitive data</h3>
    <h3 class="text-with-margin unbold-text"> If you create an account with LifeSense Group apps, your personal data—including sensitive data and data related to your health—is stored on your device and is also stored and processed on LifeSense Group servers. This is done so we can offer you the option of backing up your data and to enable additional features.
      <br> <br> By creating an account with LifeSense Group you explicitly consent that: <br> <br>
      1. LifeSense Group may store and process personal data you provide through the usage of the LifeSense Group apps and through the account creation process solely for the purpose of providing LifeSense Group services to you and to improve LifeSense Group’s service features. Such LifeSense Group services may include sending you information and reminders through the LifeSense Group apps or to the email address you provided to LifeSense Group.
      <br> <br> 2. Personal data you provide to LifeSense Group through the account creation process includes personal data you enter into the LifeSense Group apps, such as your account data (e.g. your name and email address). Depending on the data you provide, it may also contain information about your age and gender.
      <br> <br> 3.  LifeSense Group may use your urine loss data to create anonymized sets of data for academic and clinical research purposes. LifeSense Group’s collaborators are individually selected through an internal vetting process. This anonymized research data cannot be linked to you as an individual or identify you in any way.
      <br> <br> You may withdraw your consent to this use of your data at any time by deleting your LifeSense Group apps account. If you choose to do so, you may continue using the LifeSense Group app without an account, but since a copy of your data will no longer be stored on our servers, please be sure to make regular backups of your data to avoid data loss—we are not able to retrieve lost data of users without LifeSense Group apps accounts.
    </h3>

    <h3 class="text-with-margin">3. Your rights</h3>
    <h3 class="text-with-margin unbold-text">
      We believe that privacy—including data privacy—is a basic human right. At LifeSense Group we strive to ensure that your rights are respected. <br> <br>
      Here are some key facts about your privacy that we would like you to know:<br> <br>
      1. 
    Our products and services have been designed to minimize the use of your personal data. We only collect and process your data for the purposes that have been previously outlined.
    <br> <br>
    2. The security of our servers is routinely verified by experts to protect your data from unauthorized access. You can contact us at info@oopsieheroes.com if you have any questions about the security of our services.
    <br> <br>
    iii. We do not retain your data in an identifiable format for longer than necessary to deliver our services.
    <br> <br> 1. LifeSense Group does not engage in any automated decision-making or profiling activities. <br> <br>
    As a user of LifeSense Group’s services and website, you may exercise your user rights to:<br> <br>
    1. Request information on your personal data processed by LifeSense Group. Upon your request, this information will be provided to you electronically.
    2. Gain access to your information by requesting a backup of your data (as explained in the next section) in a format that is readable by other companies or organizations (data portability).
    <br> <br>
    iii. Correct your personal information and health data in the app settings and in the tracking categories available in the LifeSense Group apps.<br> <br>
    1. Withdraw your consent from data processing at any time by deleting your account (as explained in the support section of the apps) and/or unsubscribing from our newsletter by clicking the link at bottom of the email or by contacting info@oopsieheroes.com.
    <br> <br>
     2. Request the complete deletion of your data, including all past data sent to third-party services used for tracking and analysis, by reaching out to info@oopsieheroes.com. Your data will be deleted within 30 days.
     <br> <br>
     3. Lodge a complaint with the relevant supervising authority if you believe LifeSense Group is processing your personal data under violation of applicable data protection regulations.
 </h3>
 <br> <br>
 <h3 class="text-with-margin">4. Data Security</h3>
 <h3 class="text-with-margin unbold-text"> We apply security measures to protect against the misuse, loss, and/or alteration of personal information under our control. We follow industry best practices when transferring and storing your data. Though we cannot ensure or guarantee that misuse, loss or alteration of information will never occur, we use all reasonable efforts to prevent it.</h3>
 <br> <br>  <h3 class="text-with-margin oblique"> 4.1 How LifeSense Group stores your personal data </h3>

 <h3 class="text-with-margin unbold-text">If you have an account with LifeSense Group, your personal profile data is stored separately from your urine loss tracking data and your service settings. This allows us to ensure the highest possible level of privacy for your cycle information. Your password will be stored when implemented using one-way encryption (“hashing” plus “salting”) and it cannot be read by us.
  <br> <span class="unbold-text oblique ">Important: LifeSense Group uses servers located in the European Union to process and store your personal data. </span><br>
  Your data is transmitted between your device and LifeSense Group’s servers using the HTTPS protocol for encryption. HTTPS is the same technology used to create secure connections for your web browser and is indicated by a padlock icon in the URL bar of your browser.
</h3>

<br> <br>
<h3 class="text-with-margin oblique">4.2 LifeSense Group’s recommendations for protecting your data </h3>
 <h3 class="text-with-margin unbold-text">We believe the biggest threat to the security and privacy of your data is if someone—probably someone you know—gains access to any of your devices. The data you enter into LifeSense Group apps is private and it should stay that way. We have outlined some ways to keep your devices secure below.
</h3>
<h3 class="text-with-margin">Protect your device: <span class="unbold-text"> i. Activate either PIN, TouchID (iPhone 5S-8), or FaceID (iPhone X) authentication for your device. This automatically encrypts your LifeSense Group data and prevents any person from using your device without your permission.</span>
</h3>
<h3 class="text-with-margin unbold-text"> 1. Set up a feature that will allow you to erase all the data from your device if it’s been lost or stolen. For iOS, activating this feature is a two-step process: first, you need to Activate “Find My iPhone” via iCloud (see instructions on Apple Support pages) and then enable “Erase your device” (see instructions on Apple Support pages). <br>
  For Android, download and set up Find My Device (formerly Android Device Manager) from the Google Play Store and, if needed, use the connected web interface to lock or wipe your phone remotely.
</h3>

<h3 class="text-with-margin">Recommendations for LifeSense Group users without accounts: <span class="unbold-text"> If you don’t register an account with LifeSense Group, all of your data will be stored solely on your device and we won’t have access to it. If you delete LifeSense Group apps or lose your device, your data in the LifeSense Group apps will also be lost. If you don’t have an account with LifeSense Group, we strongly recommend that you back up your LifeSense Group data regularly.</span></h3>
<h3 class="text-with-margin">Back up LifeSense Group apps data on iOS without an account <span class="unbold-text"> Use Apple’s backup solution via iTunes or iCloud. See Apple’s support pages for instructions.</span> </h3>
  
<h3 class="text-with-margin">5. Data transfer outside the EU and to third-party applications <br> <span class="unbold-text"> Any personal data collected from you may only be transferred to countries outside the European Union / the European Economic Area (EEA) observing applicable privacy regulations and ensuring that your privacy rights remain protected.</span>
</h3>

<br> <br><h3 class="text-with-margin"> 6. Cookies and tracking <br> <span class="unbold-text">Our website uses cookies, which are small text files that are intended to make the site better for you to use. In general, cookies are used to retain preferences, store information for things like shopping carts, and provide tracking data to third-party applications like Google Analytics. You may, however, disable cookies on LifeSense Group’s site. The most effective way to do this is to disable cookies in your browser. We suggest consulting the help section of your browser or doing your own web research on how to disable cookies. <br> The LifeSense Group apps and our website also use third-party analysis and tracking services to track the performance of our services, understand how you use our services, and offer you an improved and safer experience. <br> Information on your usage of our website or of the LifeSense Group app may be collected and processed by LifeSense Group, or a third party engaged by LifeSense Group using a unique identification number assigned to you. Such usage information will be deleted as soon as this information is no longer required for the purpose collected, and will not be shared with third parties besides those mentioned under Section 6.2 after being anonymized.
</span></h3><br><br>
<h3 class="text-with-margin oblique">6.1 Your consent for LifeSense Group tracking and analysis</h3>
<h3 class="text-with-margin unbold-text">By using our apps and our website you consent that LifeSense Group may use cookies and third-party services, and collect your usage data under a unique identifier, for the purposes of tracking, analysis, and improvement of our website and app.
  <br> You may withdraw your consent at any time, by either disabling cookies on your device or following the instructions on how to withdraw your consent individually for each third-party provider LifeSense Group uses for its third-party tracking and analysis services.
  <br> For the purpose of tracking the performance of our services and to improve LifeSense Group services LifeSense Group uses the following third-party services:
</h3>
<br><br>
<h3 class="text-with-margin oblique">6.2 Google Analytics</h3>
<h3 class="text-with-margin unbold-text">Our website uses Google Analytics, a web analysis service operated by Google Inc. (“Google”). Google Analytics uses cookies (text files) stored on your computer to allow for analysis of your visits to websites and interactions with them in order to personalize your experience and improve our services. Information produced via cookies will be transferred to and stored on a server in the USA operated by Google.
  <br> Google analyzes this information to offer reports for LifeSense Group on website usage and online usage of associated services. Google may also transfer this information to third parties either when this is required by law or when third parties are contracted by Google to process this data. Google will not allow your IP address to be linked to any other personal data. You can prevent cookies from being stored on your computer by changing your browser settings; however, if you choose to do this, your experience when visiting our website or using some of our features may be altered.
  <br> By using LifeSense Group’s website, you consent to have non-personal data used and processed by Google as described above. You can withdraw consent for this use of your data at any time, but this withdrawal only applies to future activities.
</h3>

<br><br>
<h3 class="text-with-margin oblique">6.3</h3>
<h3 class="text-with-margin unbold-text"> The above mentioned company is compliant with the EU-US Privacy Shield Framework that ensures that European data privacy requirement are met. The privacy policy of these services can be found on their respective websites.
  <br>
  Read more about the EU-US Privacy Shield Framework.</h3>
  <br><br>
  <h3 class="text-with-margin">7. Communications and newsletter activities </h3>
  <h3 class="text-with-margin unbold-text">LifeSense Group uses your personal information, such as your email address, to contact you with messages, emails, and newsletters. These include push notifications and in-app messages, informational content about health delivered to you via email, as well as occasional promotional materials that may be of interest to you, also sent via email.
    <br> Such services are only provided to you if you have signed up for the newsletter service or given your consent for these notifications. You can withdraw your consent at any time from either or both of the two—you can unsubscribe from our newsletter by clicking the unsubscribe link at the bottom of the message and disable notifications sent by LifeSense Group in your device settings.
    <br> In order to provide these services, LifeSense Group may forward information such as your email address to third-party providers in order to carry out such newsletter service or notification. These providers are the Rocket Science Group LLC (“MailChimp”), seated in Atlanta, USA, which may process your email address, name and usage data to send you informational and occasional commercial content via email.
    <br> The privacy policy of these services can be found on their respective websites. This company is compliant with the EU-US Privacy Shield Framework that ensures that European data privacy requirements are met.
  </h3> 
  <br><br>

<h3 class="text-with-margin">8. Changes to this Privacy Policy </h3>
<h3 class="text-with-margin unbold-text">LifeSense Group reserves the right to amend this Privacy Policy from time to time to reflect changes in the law, our data collection and data use practices, the features of LifeSense Group’s services, or advances in technology. Please check this page periodically for changes. If we make a change to this Privacy Policy that, in our sole discretion, is material, we will notify you by posting notice of these changes in this Privacy Policy.  
</h3>

<h3 class="text-with-margin unbold-text oblique">If any part of our Privacy Policy was unclear or if you have further questions, get in touch at info@oopsieheroes.com.
  </h3>

<h3 class="text-with-margin unbold-text"> ©2019 LifeSense Group B.V.</h3>

  {/if}
</div>


  </div>




