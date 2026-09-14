import { Mail } from 'lucide-react';

export function BusinessContact() {
  return (
    <section className="article-contact">
      <div className="site-container article-contact-inner">
        <div>
          <p className="eyebrow"><span /> LET&apos;S TALK</p>
          <h2>우리 팀의 고민도<br />편하게 이야기해주세요.</h2>
        </div>
        <a className="button" href="mailto:butternote.notion@gmail.com"><Mail aria-hidden="true" size={18} /> 교육·구축 문의</a>
      </div>
    </section>
  );
}
