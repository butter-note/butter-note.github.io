import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { analytics } from '@/lib/analytics';
import { pageMetadata } from '@/lib/seo';
import { formatDate, pages, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata(pages.privacy);

// Sections below follow the analytics IDs in lib/site.ts, so the policy always matches what the site loads.
const usesGa = Boolean(analytics.googleAnalyticsId);
const usesClarity = Boolean(analytics.clarityProjectId);
const usesAnalytics = usesGa || usesClarity;

const externalServices = [
  { name: 'Google Tag Manager (Google LLC)', purpose: '분석 도구 설치·관리', when: '모든 페이지를 열 때' },
  ...(usesGa ? [{ name: 'Google Analytics (Google LLC)', purpose: '방문 통계 분석', when: '모든 페이지를 열 때' }] : []),
  ...(usesClarity ? [{ name: 'Microsoft Clarity (Microsoft Corporation)', purpose: '이용 행태 분석 (클릭·스크롤 히트맵, 화면 이용 기록 재생)', when: '모든 페이지를 열 때' }] : []),
  { name: 'Google Fonts (Google LLC)', purpose: '제목·손글씨 글꼴 제공', when: '모든 페이지를 열 때' },
  { name: 'jsDelivr', purpose: '브랜드 글꼴 파일 제공', when: '모든 페이지를 열 때' },
  { name: 'YouTube (Google LLC) — youtube-nocookie.com, i.ytimg.com', purpose: '무료 강의 영상 썸네일과 재생', when: '썸네일은 강의 페이지를 열 때, 플레이어는 재생을 눌렀을 때' },
  { name: 'Vimeo (Vimeo.com, Inc.)', purpose: '무료 강의 영상 재생', when: '재생을 눌렀을 때' },
];

const cookies = [
  ...(usesGa ? [{ name: '_ga, _ga_<측정 ID>', owner: 'Google Analytics (이 사이트 주소)', purpose: '방문자를 구분해 재방문과 이용 흐름을 집계합니다. 2년간 유지됩니다.' }] : []),
  ...(usesClarity
    ? [
        { name: '_clck, _clsk', owner: 'Microsoft Clarity (이 사이트 주소)', purpose: '방문자를 가명 식별자로 구분하고, 한 번의 방문에서 본 여러 페이지를 하나의 기록으로 연결합니다.' },
        { name: 'CLID, MUID, MR, SM, ANONCHK', owner: 'Microsoft (clarity.ms 등 Microsoft 주소)', purpose: 'Clarity를 쓰는 여러 사이트에서 같은 브라우저를 구분합니다. Microsoft는 MUID를 광고·사이트 분석 등에도 사용합니다.' },
      ]
    : []),
];

const transfers = [
  ...(usesGa
    ? [{ recipient: 'Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA)', country: '미국', items: '제2조 제1항의 자동 수집 정보', purpose: '방문 통계 분석 (Google Analytics)' }]
    : []),
  ...(usesClarity
    ? [{ recipient: 'Microsoft Corporation (One Microsoft Way, Redmond, WA 98052, USA)', country: '미국 등 Microsoft Azure 클라우드가 운영되는 국가', items: '제2조 제1항의 자동 수집 정보와 화면 이용 기록', purpose: '이용 행태 분석 (Microsoft Clarity)' }]
    : []),
];

const analyticsProviders = [usesGa ? 'Google' : '', usesClarity ? 'Microsoft' : ''].filter(Boolean).join(', ');

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <article className="article-page">
        <header className="article-header site-container">
          <p className="eyebrow"><span /> PRIVACY POLICY</p>
          <h1>개인정보처리방침</h1>
          <p>{site.name}는 홈페이지를 이용하는 분들의 개인정보를 소중히 다룹니다. 어떤 정보가 어떻게 처리되는지, 그리고 이용자가 어떤 권리를 가지는지 안내합니다.</p>
          <div className="article-detail-meta">시행일 {formatDate(site.privacyEffectiveDate)}</div>
        </header>
        <div className="article-body site-container">
          <div className="notion-markdown legal-content">
            <h2>제1조 (총칙)</h2>
            <p>{site.name}(이하 “{site.name}”)는 「개인정보 보호법」 등 관련 법령을 준수하며, 홈페이지 {site.url}(이하 “사이트”)를 이용하는 분들의 개인정보를 보호하기 위해 이 방침을 두고 있습니다. 사이트는 회원 가입·로그인·입력 폼이 없는 정적 홈페이지로, 서버에 개인정보를 저장하는 데이터베이스를 운영하지 않습니다.</p>

            <h2>제2조 (처리하는 개인정보의 항목과 수집 방법)</h2>
            <ol>
              <li>
                <strong>자동으로 수집되는 정보.</strong>{' '}
                {usesAnalytics ? (
                  <>
                    사이트는 방문 통계와 이용 행태 분석을 위해 아래 도구를 사용합니다. 이 과정에서 접속 기록(IP 주소 등), 브라우저·운영체제·기기 종류, 방문 일시, 열람한 페이지, 유입 경로, 쿠키 식별자가 각 제공자의 서버로 전송되어 처리됩니다.
                    <ul>
                      {usesGa ? <li>Google Analytics: 위 정보로 방문자 수, 페이지별 조회 수, 유입 경로 같은 통계를 만듭니다.</li> : null}
                      {usesClarity ? (
                        <li>Microsoft Clarity: 위 정보와 함께 페이지에서의 클릭, 스크롤, 마우스 움직임 같은 화면 이용 기록을 수집해 히트맵과 이용 기록 재생을 만듭니다. 입력창에 쓴 내용과 화면의 숫자·이메일 주소는 가려진 상태로 수집되어 알아볼 수 없습니다.</li>
                      ) : null}
                    </ul>
                  </>
                ) : (
                  <>사이트는 현재 방문 통계 도구를 사용하지 않습니다. 다만 분석 도구 설치에 쓰는 Google Tag Manager 스크립트를 불러오는 과정에서 접속 정보(IP 주소, 브라우저 정보 등)가 Google에 전달될 수 있습니다.</>
                )}
              </li>
              <li>
                <strong>이메일 문의.</strong> 사이트에 안내된 이메일 주소({site.email})로 직접 문의하시는 경우, 이메일 주소와 이용자가 기재한 성함·소속·문의 내용이 수집됩니다. 사이트에는 입력 폼이 없으며, 전송은 이용자의 이메일 서비스를 통해 이루어집니다.
              </li>
              <li>
                <strong>외부 서비스 리소스.</strong> 아래 외부 서비스의 글꼴·영상 등을 불러오는 과정에서 해당 서비스 제공자에게 접속 정보(IP 주소, 브라우저 정보 등)가 전달될 수 있습니다. 각 서비스의 처리는 해당 제공자의 개인정보처리방침을 따릅니다.
              </li>
            </ol>
            <div className="notion-table-scroll">
              <table>
                <thead>
                  <tr><th scope="col">서비스</th><th scope="col">용도</th><th scope="col">불러오는 시점</th></tr>
                </thead>
                <tbody>
                  {externalServices.map((service) => (
                    <tr key={service.name}><td>{service.name}</td><td>{service.purpose}</td><td>{service.when}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>제3조 (개인정보의 처리 목적)</h2>
            <ul>
              {usesAnalytics ? <li>사이트 방문 통계 분석과 콘텐츠·서비스 개선</li> : null}
              {usesClarity ? <li>페이지 이용 흐름을 살펴 화면 구성과 안내 문구 개선</li> : null}
              <li>교육·구축 상담 등 문의에 대한 응대와 기록</li>
            </ul>

            <h2>제4조 (개인정보의 보유 및 이용 기간)</h2>
            <ul>
              {usesGa ? <li>방문 통계: Google Analytics의 데이터 보존 설정에 따라 {site.analyticsRetention} 동안 보관하며, 기간이 지나면 자동으로 삭제됩니다.</li> : null}
              {usesClarity ? <li>이용 행태 기록: Microsoft Clarity의 보관 정책에 따라 {site.clarityRetention} 동안 보관하며, 기간이 지나면 자동으로 삭제됩니다.</li> : null}
              <li>이메일 문의: 문의 처리가 완료된 후 {site.inquiryRetention} 동안 보관한 뒤 파기합니다. 이용자가 삭제를 요청하면 지체 없이 파기합니다.</li>
              <li>관련 법령에서 보존을 요구하는 경우 그 기간 동안 보관합니다.</li>
            </ul>

            <h2>제5조 (개인정보의 제3자 제공)</h2>
            <p>{site.name}는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거하거나 수사기관이 적법한 절차에 따라 요구하는 경우에는 예외로 합니다.</p>

            <h2>제6조 (개인정보 처리의 위탁 및 국외 이전)</h2>
            {usesAnalytics ? (
              <>
                <p>방문 통계와 이용 행태 분석을 위해 다음과 같이 개인정보가 국외로 이전됩니다.</p>
                {transfers.map((transfer) => (
                  <div className="notion-table-scroll" key={transfer.recipient}>
                    <table>
                      <tbody>
                        <tr><th scope="row">이전받는 자</th><td>{transfer.recipient}</td></tr>
                        <tr><th scope="row">이전되는 국가</th><td>{transfer.country}</td></tr>
                        <tr><th scope="row">이전 항목</th><td>{transfer.items}</td></tr>
                        <tr><th scope="row">이전 일시·방법</th><td>사이트 이용 시 네트워크를 통해 전송</td></tr>
                        <tr><th scope="row">이용 목적</th><td>{transfer.purpose}</td></tr>
                        <tr><th scope="row">보유·이용 기간</th><td>제4조에 따름</td></tr>
                      </tbody>
                    </table>
                  </div>
                ))}
                <p>
                  국외 이전을 원하지 않는 경우 제7조의 방법으로 쿠키를 차단할 수 있습니다.
                  {usesGa ? (
                    <> Google Analytics는 <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics 차단 브라우저 부가기능</a>으로도 막을 수 있습니다.</>
                  ) : null}
                  {usesClarity ? (
                    <> Microsoft Clarity는 브라우저의 GPC(Global Privacy Control) 신호를 따르며, <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">디지털광고연합(DAA) 수집 거부 페이지</a>에서 Microsoft를 선택해 거부할 수도 있습니다.</>
                  ) : null}{' '}
                  이 경우에도 사이트의 콘텐츠는 모두 이용할 수 있습니다.
                </p>
              </>
            ) : (
              <p>사이트는 방문 통계 도구를 사용하지 않으므로, 분석을 위해 개인정보를 국외로 이전하지 않습니다.</p>
            )}

            <h2>제7조 (쿠키의 사용과 거부)</h2>
            {cookies.length ? (
              <>
                <p>사이트는 방문 통계와 이용 행태 분석을 위해 아래 쿠키를 사용합니다. 쿠키는 브라우저에 저장되는 작은 텍스트 파일로, 이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다.</p>
                <div className="notion-table-scroll">
                  <table>
                    <thead>
                      <tr><th scope="col">쿠키</th><th scope="col">설정하는 곳</th><th scope="col">용도</th></tr>
                    </thead>
                    <tbody>
                      {cookies.map((cookie) => (
                        <tr key={cookie.name}><td>{cookie.name}</td><td>{cookie.owner}</td><td>{cookie.purpose}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>사이트는 현재 분석용 쿠키를 사용하지 않습니다. 쿠키는 브라우저에 저장되는 작은 텍스트 파일로, 이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다.</p>
            )}
            <ul>
              <li>Chrome: 설정 → 개인 정보 보호 및 보안 → 서드 파티 쿠키 (이 사이트 주소의 쿠키는 사이트 설정 → 기기 내 사이트 데이터)</li>
              <li>Safari: 설정 → 개인 정보 보호 → 쿠키 및 웹사이트 데이터</li>
              <li>Edge: 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터 관리 및 삭제</li>
            </ul>
            <p>쿠키를 거부해도 사이트의 글·강의·템플릿 안내를 보는 데에는 제한이 없습니다.</p>

            <h2>제8조 (이용자의 권리와 행사 방법)</h2>
            <p>이용자는 자신의 개인정보에 대해 열람·정정·삭제·처리정지를 요구할 수 있습니다. 요청은 {site.email}로 보내주시면 확인 후 지체 없이 조치하고 결과를 알려드립니다. 법정대리인이나 위임받은 사람도 같은 방법으로 권리를 행사할 수 있습니다.</p>

            <h2>제9조 (개인정보의 파기)</h2>
            <p>보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구할 수 없는 방법으로 삭제합니다.</p>

            <h2>제10조 (개인정보의 안전성 확보 조치)</h2>
            <ul>
              <li>사이트는 정적 페이지로 운영되어 서버에 개인정보 데이터베이스를 두지 않습니다.</li>
              <li>문의 이메일은 운영자로 접근 권한을 제한하고 계정 보안 설정을 유지합니다.</li>
              {analyticsProviders ? <li>외부 분석 도구는 각 제공자({analyticsProviders})의 보안·개인정보 정책을 따릅니다.</li> : null}
              {usesClarity ? <li>Microsoft Clarity는 입력창 내용과 숫자·이메일 주소를 가린 상태로 기록하도록 설정해 운영합니다.</li> : null}
            </ul>

            <h2>제11조 (개인정보 보호책임자)</h2>
            <div className="notion-table-scroll">
              <table>
                <tbody>
                  <tr><th scope="row">보호책임자</th><td>{site.privacyOfficer}</td></tr>
                  <tr><th scope="row">연락처</th><td><a href={`mailto:${site.email}`}>{site.email}</a></td></tr>
                </tbody>
              </table>
            </div>

            <h2>제12조 (권익침해에 대한 구제 방법)</h2>
            <p>개인정보 침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의할 수 있습니다.</p>
            <ul>
              <li>개인정보침해신고센터 (한국인터넷진흥원): 국번 없이 118, <a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener noreferrer">privacy.kisa.or.kr</a></li>
              <li>개인정보분쟁조정위원회: 1833-6972, <a href="https://www.kopico.go.kr" target="_blank" rel="noopener noreferrer">www.kopico.go.kr</a></li>
              <li>대검찰청 사이버수사과: 국번 없이 1301</li>
              <li>경찰청 사이버수사국: 국번 없이 182</li>
            </ul>

            <h2>제13조 (방침의 변경)</h2>
            <p>이 방침은 {formatDate(site.privacyEffectiveDate)}부터 시행합니다. 내용이 추가·삭제·수정되는 경우 시행 7일 전부터 사이트에 알립니다.</p>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
