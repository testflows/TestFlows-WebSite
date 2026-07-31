---
title: Contact
description: Get in touch with the TestFlows team
date: 2019-11-23 10:41:21
fullwidth: true
---

<section class="contact-page">
    <div class="container contact-page-inner">
        <div class="row contact-page-row">
            <div class="col-lg-5 contact-visual">
                <div class="contact-visual-panel">
                    <div class="contact-visual-art" aria-hidden="true">
                        <img src="/images/side-wave-website.svg" alt="">
                    </div>
                    <h1>Let's talk</h1>
                    <p>Questions about TestFlows, support for your test program, or partnerships — we are happy to hear from you.</p>
                    <div class="contact-visual-links">
                        <a class="contact-visual-link" href="mailto:contact@testflows.com">
                            <span class="fas fa-envelope" aria-hidden="true"></span>
                            contact@testflows.com
                        </a>
                        <a class="contact-visual-link" href="https://github.com/testflows">
                            <span class="fab fa-github" aria-hidden="true"></span>
                            github.com/testflows
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-lg-7 contact-form-col">
                <form class="needs-validation contact-us" novalidate onsubmit="return submitContactUs(this);">
                    <div class="contact-form-intro">
                        <h2>What are you testing?</h2>
                        <p>Tell us a bit about your project. We will get back shortly.</p>
                    </div>
                    <div class="form-fields">
                        <div class="contact-name-row">
                            <div class="contact-field">
                                <label for="firstname">First name</label>
                                <input type="text" class="form-control" id="firstname" required autocomplete="given-name">
                                <div class="invalid-feedback">Please enter your first name</div>
                            </div>
                            <div class="contact-field">
                                <label for="lastname">Last name</label>
                                <input type="text" class="form-control" id="lastname" required autocomplete="family-name">
                                <div class="invalid-feedback">Please enter your last name</div>
                            </div>
                        </div>
                        <div class="contact-field">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" id="email" required autocomplete="email">
                            <div class="invalid-feedback">Please enter a valid email</div>
                        </div>
                        <div class="contact-field">
                            <label for="company">Company</label>
                            <input type="text" class="form-control" id="company" required autocomplete="organization">
                            <div class="invalid-feedback">Please enter your company</div>
                        </div>
                        <div class="contact-field">
                            <label for="usecase">How can we help?</label>
                            <textarea class="form-control" id="usecase" rows="6" required></textarea>
                            <div class="invalid-feedback">Please tell us briefly how we can help</div>
                        </div>
                        <div class="contact-field d-none" aria-hidden="true">
                            <label for="title">Title</label>
                            <input type="text" class="form-control" id="title" tabindex="-1" autocomplete="off">
                        </div>
                        <p class="contact-privacy">
                            By clicking Submit, you acknowledge that Katteli Inc. will process your personal information in accordance with our privacy policy.
                        </p>
                        <p class="contact-error failed-submission d-none">
                            <span role="error-message">Something went wrong while submitting.</span>
                            Try again, or write us at <strong>contact@testflows.com</strong>.
                        </p>
                        <button class="btn contact-submit" id="submit" type="submit">
                            <span role="submit">Submit <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                            <span role="processing" class="d-none">
                                <span class="spinner-border text-light" style="width: 1.1em; height: 1.1em;" role="status"></span>
                                Sending…
                            </span>
                        </button>
                    </div>
                    <div class="contact-success successful-submission d-none">
                        <div class="contact-success-icon" aria-hidden="true"><span class="fas fa-check"></span></div>
                        <h3>Message sent</h3>
                        <p>
                            Thanks — we received your note for <span role="contact-email"></span> and will be in touch shortly.
                            You can also follow up at <strong>contact@testflows.com</strong>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section>

<script>
function submitContactUs(form) {
    if (form.checkValidity() === false) {
        document.activeElement && document.activeElement.blur()
        invalid = form.querySelector(":invalid")
        if (invalid && invalid.id !== "title") {
            invalid.focus()
            return true
        }
    }
    if (form.querySelector("#title").value !== '') {
        form.querySelectorAll("input").forEach(function(el) {
            el.value = ''
        })
        form.querySelector("textarea").value = ''
        return false;
    }

    var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

    body = JSON.stringify({
        "firstname": form.querySelector("#firstname").value,
        "lastname": form.querySelector("#lastname").value,
        "email": form.querySelector("#email").value,
        "company": form.querySelector("#company").value,
        "usecase": form.querySelector("#usecase").value,
        "created": (new Date()).toISOString().replace("Z", "000Z")
    })

    public_token = "j23345d234dsksjfdsl23afsdfFA234"
    public_magic_number = "d2343fe3342242324abfec12"
    signature = MD5(public_magic_number + unescape(encodeURIComponent(body)))

    form.querySelector("[role=submit]").classList.add("d-none")
    form.querySelector("[role=processing]").classList.remove("d-none")
    form.querySelector(".failed-submission").classList.add("d-none")

    response = null
    fetch(`https://api.testflows.com/public/v1/form/contact/${signature}`, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${public_token}`,
        },
        body: body
    })
    .then((resp) => {
        response = resp
        return response.text()
    })
    .then((text) => {
        if (response.ok) {
            form.querySelector(".form-fields").classList.add("d-none")
            form.querySelector(".successful-submission").classList.remove("d-none")
            form.querySelector(".successful-submission span[role=contact-email]").innerHTML = form.querySelector("#email").value
            return
        }
        try {
            data = JSON.parse(text)
        }
        catch (e) {
            data = text
        }
        if ("detail" in data)
            throw new Error(data.detail)
        if (data)
            throw new Error(JSON.stringify(data))
        throw new Error(resp.status)
    })
    .catch((e) => {
        console.log(`Error -> ${e}`)
        element = form.querySelector(".failed-submission")
        element.classList.remove("d-none")
        element.querySelector("span[role=error-message]").innerHTML = `${e}`
        form.querySelector("[role=submit]").classList.remove("d-none")
        form.querySelector("[role=processing]").classList.add("d-none")
    })

    return false
}
</script>
