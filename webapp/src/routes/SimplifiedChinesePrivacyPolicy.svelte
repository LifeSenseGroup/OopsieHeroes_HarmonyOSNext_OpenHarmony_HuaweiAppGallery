<script lang="ts">
  import { pop } from 'svelte-spa-router';
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
    overflow: auto;
    max-height: 900px;
  }

  .oblique {
    font-style: oblique;
  }

  .Arrow {
    grid-area: Arrow;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-top: max(12px, env(safe-area-inset-top));
    margin-left: max(16px, env(safe-area-inset-left));
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    touch-action: manipulation;
  }

  .back-button img {
    width: 30px !important;
    height: 30px;
    filter: brightness(0);
  }
</style>

<div id="scrollable-content">
  <div class="Arrow center">
    <button class="back-button" type="button" aria-label="Go back" on:click={() => pop()}>
      <img style="width:3vw;" src="build/images/Arrow_icon.svg" alt="返回" width="100%">
    </button>
  </div>

  <div class="Margin" style="font-family: Arial;">
    <h1 class="text-with-margin navy-blue-text">隐私政策</h1>
    <h2 class="text-with-margin">LifeSense Group 隐私政策</h2>
    <h3 class="text-with-margin unbold-text oblique">（最后更新：2026 年 8 月 2 日）</h3>
    <h3 class="text-with-margin unbold-text">LifeSense Group 相信，可穿戴技术能够帮助人们独立了解并改善自己的健康。我们充分认识到，保护尿失禁等敏感数据是一项重大责任。我们致力于实现最高标准的隐私和安全，并透明地说明我们如何处理数据。</h3>
    <h3 class="text-with-margin unbold-text">我们希望这份隐私政策清晰、诚实且透明。如有任何问题，请通过 info@oopsieheroes.com 联系我们。</h3>
    <h3 class="text-with-margin unbold-text">LifeSense Group 地址：High Tech Campus 32, 5656AE, Eindhoven, The Netherlands。更多联系信息请参见我们的网站。LifeSense Group 已指定数据保护官，可通过 info@oopsieheroes.com 联系。</h3>

    <h3 class="text-with-margin">1. LifeSense Group 如何处理您的个人数据</h3>
    <h3 class="text-with-margin unbold-text">数据处理是 LifeSense Group 所有工作的核心。当您使用我们的服务，例如 Oopsie Heroes 或 Carin Pelvic Floor Trainer 应用，或访问我们的网站时，部分个人和非个人数据会通过内部工具及第三方工具被收集、存储和分析。</h3>
    <h3 class="text-with-margin unbold-text">我们处理数据的目的包括了解您的需求并改进服务、提供个性化健康信息，以及推进有关尿失禁的科学研究。我们不会处理能够直接识别您身份的个人数据或健康数据，除非您明确同意。</h3>

    <h3 class="text-with-margin oblique">1.1 了解您的需求并改进服务</h3>
    <h3 class="text-with-margin unbold-text">当您使用应用或访问网站时，我们会收集设备、事件和使用情况以及 IP 地址等数据，以了解产品使用情况、分析并修复问题，并提供更可靠的服务。我们会尽可能减少收集的数据量。</h3>
    <h3 class="text-with-margin">设备数据 <span class="unbold-text">包括设备型号、名称、标识符、设置、应用标识符、崩溃信息，以及浏览器、操作系统和系统设置。</span></h3>
    <h3 class="text-with-margin">事件和使用数据 <span class="unbold-text">包括您访问的页面或在应用中打开的标签页等信息。我们将这些信息汇总，用于了解用户最需要的功能。</span></h3>
    <h3 class="text-with-margin">IP 地址 <span class="unbold-text">我们收集浏览器或移动设备提供的 IP 地址，以向设备提供服务，并出于统计和分析目的确定大致位置。</span></h3>

    <h3 class="text-with-margin oblique">1.2 提供个性化信息</h3>
    <h3 class="text-with-margin unbold-text">您在应用中记录的健康和活动数据属于敏感个人数据。未经您的明确许可，LifeSense Group 不会存储此类数据。只有在您创建 LifeSense Group 帐户并明确同意后，我们才会将健康数据与创建帐户所需的个人数据存储在安全服务器上。您可以随时删除帐户撤回同意；没有帐户时，数据仅存储在您的设备上，请定期备份。</h3>
    <h3 class="text-with-margin">帐户数据 <span class="unbold-text">创建帐户需要您的姓名、姓氏和电子邮件地址。</span></h3>
    <h3 class="text-with-margin">健康和敏感数据 <span class="unbold-text">包括年龄、性别以及过去和当前的尿失禁事件日期，用于向您提供服务。</span></h3>
    <h3 class="text-with-margin">麦克风 <span class="unbold-text">我们会从移动设备读取麦克风音频以检测 Oopsie Heroes 传感器信号，但不会保存音频。</span></h3>

    <h3 class="text-with-margin oblique">1.3 推进科学研究</h3>
    <h3 class="text-with-margin unbold-text">LifeSense Group 与学术研究人员合作，推动可穿戴技术改善健康。我们仅在严格匿名化、删除可能识别用户的信息后，向科学研究提供数据。我们努力以所有用户都易于阅读的方式发布研究结果。您可以随时删除帐户，撤回将数据用于未来研究的同意。</h3>

    <h3 class="text-with-margin">2. 您对健康和敏感数据处理的同意</h3>
    <h3 class="text-with-margin unbold-text">创建帐户后，您的个人数据（包括健康和敏感数据）会存储并处理在您的设备和 LifeSense Group 服务器上，以便备份数据并启用更多功能。您同意我们仅为提供和改进服务而处理您提供的数据，并可能使用尿失禁数据创建匿名数据集用于学术和临床研究。您可以随时删除帐户撤回同意。</h3>

    <h3 class="text-with-margin">3. 您的权利</h3>
    <h3 class="text-with-margin unbold-text">隐私是基本人权。您有权请求了解我们处理的个人数据、获取数据备份、在应用设置中更正个人和健康信息、随时撤回同意、请求删除数据，以及在认为我们违反数据保护法规时向相关监管机构投诉。删除请求请联系 info@oopsieheroes.com，我们将在 30 天内删除您的数据。</h3>

    <h3 class="text-with-margin">4. 数据安全</h3>
    <h3 class="text-with-margin unbold-text">我们采取安全措施防止个人信息被滥用、丢失或更改，并遵循行业最佳实践传输和存储数据。帐户资料与尿失禁记录和服务设置分开存储。服务器位于欧盟，设备与服务器之间使用 HTTPS 加密传输。</h3>
    <h3 class="text-with-margin oblique">4.1 保护数据的建议</h3>
    <h3 class="text-with-margin unbold-text">请为设备启用 PIN、Touch ID 或 Face ID，并设置设备丢失后的远程擦除功能。没有帐户的用户应定期备份数据；删除应用或丢失设备可能导致本地数据丢失。</h3>

    <h3 class="text-with-margin">5. 向欧盟以外地区及第三方应用传输数据</h3>
    <h3 class="text-with-margin unbold-text">收集的个人数据仅会在遵守适用隐私法规并确保您的隐私权受到保护的情况下，传输到欧盟或欧洲经济区以外的国家。</h3>
    <h3 class="text-with-margin">6. Cookie 和跟踪</h3>
    <h3 class="text-with-margin unbold-text">我们的网站使用 Cookie 来保存偏好、提供服务并向第三方分析工具提供跟踪数据。您可以在浏览器或设备中禁用 Cookie。应用和网站也使用第三方分析服务来了解服务使用情况并改善体验，相关信息会在不再需要时删除，并会在匿名化后按本政策处理。</h3>
    <h3 class="text-with-margin oblique">6.1 Google Analytics</h3>
    <h3 class="text-with-margin unbold-text">网站使用 Google Analytics 分析访问和互动情况。Cookie 产生的信息可能会传输并存储在美国的 Google 服务器上。您可以更改浏览器设置阻止 Cookie；使用网站即表示您同意 Google 按上述方式处理非个人数据，您可以随时撤回对未来活动的同意。</h3>

    <h3 class="text-with-margin">7. 通信和新闻通讯</h3>
    <h3 class="text-with-margin unbold-text">如果您订阅新闻通讯或同意通知，LifeSense Group 可能使用您的电子邮件地址发送推送通知、应用内消息、健康信息和偶尔的推广内容。您可以通过邮件中的取消订阅链接或设备设置随时撤回同意。</h3>
    <h3 class="text-with-margin">8. 隐私政策的变更</h3>
    <h3 class="text-with-margin unbold-text">LifeSense Group 可能根据法律、数据收集和使用方式、服务功能或技术变化不时修改本政策。请定期查看本页面。如有重大变更，我们会在本政策中发布通知。</h3>
    <h3 class="text-with-margin unbold-text oblique">如果本隐私政策有任何不清楚之处，或您有其他问题，请通过 info@oopsieheroes.com 联系我们。</h3>
    <h3 class="text-with-margin unbold-text">©2019 LifeSense Group B.V.</h3>
  </div>
</div>
