# Yapay Zekâ Kullanım Özeti

**Proje:** Haftalık Proje Durum Raporlama ve CTO Takip Sistemi
**Hazırlayan:** Cemile Aksu
**Son güncelleme:** 26.08.2026

Bu doküman, staj yönetmeliği bölüm 1.4 ve bölüm 10.1'in ("AI kullanım özeti: kullanıldıysa nerede, ne amaçla, nasıl doğrulandı") beklediği açıklamayı içerir.

---

## 1. Temel ilke

Yönetmelik bölüm 1.4 şunu söylüyor:

> "Yapay zekâyı özellikle öğrenme amacıyla kullanmanız önerilir. Kavram açıklama, hata mesajını anlama, örnek üretme, test senaryosu çıkarma, dokümantasyon taslağı ve kod gözden geçirme gibi alanlarda destek alabilirsiniz; ancak **üretilen sonucu anlamadan doğrudan kullanmamalı ve doğrulamalısınız.**"

Bu projede benimsenen kural: **AI çıktısı hiçbir zaman doğrulanmadan projeye alınmadı.** Her çıktı en az bir somut kontrolden geçirildi — derleme, uygulamayı çalıştırma, Swagger/tarayıcı üzerinden deneme veya dokümanla karşılaştırma.

---

## 2. Nerede ve ne amaçla kullanıldı

> ⚠️ **TAMAMLANACAK — imzadan önce doldurulmalı.**
> Aşağıdaki tablo, yönetmeliğin bölüm 1.4'te saydığı kullanım alanlarını içeren bir çerçevedir. Kendi sürecinize göre **kullanmadığınız satırları silin**, kullandıklarınızı somut örnekle doldurun. Final sunumunda bu tablonun içeriği sorulacaktır; bu nedenle yalnızca gerçekten yaptığınız kullanımlar kalmalıdır.

| Alan | Ne için kullanıldı | Somut örnek | Çıktı nasıl doğrulandı |
| --- | --- | --- | --- |
| Kavram açıklama | *(örn. Spring Security filtre zinciri, JPA Specification mantığı)* | *(doldurun)* | *(örn. küçük bir örnek yazıp çalıştırarak)* |
| Hata mesajını anlama | *(örn. CORS / CSRF hataları, Hibernate şema hataları)* | *(doldurun)* | *(örn. önerilen düzeltme uygulanıp hatanın kaybolduğu doğrulandı)* |
| Örnek üretme | *(örn. Specification veya @PreAuthorize kullanım kalıbı)* | *(doldurun)* | *(örn. projeye uyarlanıp Swagger'dan test edildi)* |
| Test senaryosu çıkarma | *(örn. negatif ve yetkisiz erişim senaryolarının listelenmesi)* | *(doldurun)* | *(örn. senaryolar elle çalıştırılıp sonuçları test-raporu.md'ye yazıldı)* |
| Dokümantasyon taslağı | *(örn. README veya karar notu bölüm taslakları)* | *(doldurun)* | *(örn. koda bakılarak madde madde doğrulandı)* |
| Kod gözden geçirme | *(örn. yetkilendirme kontrollerinin gözden geçirilmesi)* | *(doldurun)* | *(örn. önerilen değişiklik anlaşıldıktan sonra uygulandı)* |

### 2.1 Teslim öncesi denetim (26.08.2026)

Bu satır repository üzerinden doğrulanabilir olduğu için önceden doldurulmuştur.

| Konu | İçerik |
| --- | --- |
| **Ne için** | Teslim öncesi bağımsız bir denetim: repository'nin staj yönetmeliği, Ön Analiz ve Teknik Karar Notu ile tutarlılığının kontrol edilmesi |
| **Kapsam** | Yönetmelik gereksinim matrisi, Ön Analiz ↔ kod karşılaştırması, Teknik Karar ↔ kod karşılaştırması, Git geçmişi denetimi, kod kalitesi ve test kapsamı değerlendirmesi |
| **Nasıl doğrulandı** | Denetimin bulguları varsayıma değil çalıştırılmış komut çıktısına dayandırıldı: `mvnw -DskipTests compile`, `mvnw test`, `npm run build`, `npm run lint`, `git log`, `git status`. Sonuçlar [`test-raporu.md`](test-raporu.md) bölüm 2'de kayıtlıdır |
| **Ne bulundu** | README'nin son bölümlerinin T14/T15 sonrası güncellenmediği ve dokümanın kendi üst bölümleriyle çeliştiği; iki dokümanın repository'de bulunmayan test artefaktlarına atıf yaptığı; `npm run lint`'in 10 hata verdiği; konsolide test raporunun ve bu dokümanın eksik olduğu |
| **Ne yapıldı** | Bulunan dokümantasyon tutarsızlıkları düzeltildi (commit `e4a6aac`, `bbbf38a`), test raporu oluşturuldu (`018820d`). Lint bulgusu düşük öncelikli olarak açık bırakıldı ve `test-raporu.md`'de H7 olarak kaydedildi |
| **Kod değişikliği** | Bu denetim kapsamında **uygulama kodu değiştirilmedi**; yalnızca dokümantasyon güncellendi. Değişikliklerin tamamı `feature/final-delivery-docs` dalındaki commit'lerden izlenebilir |

### 2.2 Final MVP kapsam denetimi ve kontrollü tamamlama (26.08.2026)

Bu satır da repository üzerinden doğrulanabilir olduğu için önceden doldurulmuştur.

| Konu | İçerik |
| --- | --- |
| **Ne için** | Staj yönetmeliği, Ön Analiz ve kabul kriterleri ile repository'nin karşılaştırılması; MVP kapsamında olduğu hâlde eksik kalan özelliklerin tespit edilip kontrollü şekilde tamamlanması |
| **Kapsam** | Üç kaynak dokümanın (yönetmelik, Ön Analiz, Teknik Karar Notu) kod ile madde madde karşılaştırılması, kullanılmayan kodun aranması, yetki/validasyon/hata yönetiminin gözden geçirilmesi, eksik özelliklerin uygulanması ve dokümanların gerçekle hizalanması |
| **Nasıl doğrulandı** | Bulgular varsayıma değil çalıştırılmış komut ve gerçek HTTP isteklerine dayandırıldı. Kullanılmayan kod iddiaları `grep` ile doğrulandı (tahminle dosya silinmedi). Eklenen endpointler backend + PostgreSQL çalışır durumdayken curl ile, oturum çerezi ve CSRF token'ı kullanılarak test edildi; sonuçlar [`test-raporu.md`](test-raporu.md) bölüm 10'da kayıtlıdır |
| **Ne bulundu** | (1) Rapor ve proje güncelleme endpointlerinin MVP'de zorunlu olduğu — yönetmelik 5.4, Ön Analiz 5 ve 7.4. (2) Marka logosunun tüm rollerde `/dashboard`'a gitmesi nedeniyle üç rolün erişim reddi ekranına düşmesi. (3) Admin'de iş kalemi sekmesinin sürekli hata vermesi. (4) `BackendStatus` bileşeninin hiç kullanılmaması. (5) **H8:** enum'a yeni değer eklendiğinde uygulamanın mevcut veritabanında açılmaması |
| **Ne yapıldı** | Eksik özellikler mevcut mimariye (Controller → Service → Repository → DTO) uyularak eklendi; yeni katman veya soyutlama oluşturulmadı. Bulunan kusurlar düzeltildi, kullanılmayan kod temizlendi, dokümanlar güncellendi |
| **Neyin yapılmadığı** | Silme endpointleri (Ön Analiz 12.3 MVP dışı sayıyor), sorumlu filtresi, `npm run lint` düzeltmesi (sekiz sayfanın veri yükleme mantığının yeniden yazılmasını gerektirdiği için) ve otomatik test altyapısı bilinçli olarak kapsam dışı bırakıldı; gerekçeleriyle birlikte kayıtlıdır |
| **Önemli not** | **H8 yalnızca uygulamayı gerçekten çalıştırarak bulunabildi.** Derleme ve mevcut test paketi bu hatayı yakalamadı. Bu, R1'in (otomatik test kapsamı yok) neden en yüksek risk olduğunun somut kanıtıdır |

---

## 3. AI'nın kullanılmadığı yerler

Bu ayrımın yazılması, kullanım alanlarının yazılması kadar önemlidir.

- **Teknik kararlar.** Ana geliştirme yönü, dil/framework seçimi, veritabanı seçimi, katmanlı mimari ve kimlik doğrulama yöntemi (oturum vs. JWT) kararları Teknik Karar Notu ve [`t14-authorization-matrix.md`](t14-authorization-matrix.md) bölüm 5'te gerekçeleriyle birlikte kendi kararım olarak yazılmıştır.
- **Kapsam kararları.** MVP sınırı, hangi özelliğin kapsam dışı bırakılacağı ve Ön Analiz'deki açık soruların cevapları proje gereksinimlerine göre belirlenmiştir.
- **Test sonuçları.** Hiçbir test sonucu üretilmemiş, yalnızca gerçekten çalıştırılan senaryolar kaydedilmiştir. Repository'de bulunmayan bir test artefaktına atıf yapılmamasına özellikle dikkat edilmiştir (bkz. `bbbf38a`).

---

## 4. Ne öğrendim

> ⚠️ **TAMAMLANACAK — imzadan önce doldurulmalı.**
> Yönetmelik bölüm 1.4: *"Final sunumunda yapay zekâyı nerede, ne için kullandığınız; çıktıyı nasıl kontrol ettiğiniz ve bu süreçte **ne öğrendiğiniz** sorulacaktır."* Aşağıdaki başlıklar birer hatırlatmadır; kendi cümlelerinizle 2-3 madde yazın.

- AI'nın hangi tür sorularda gerçekten hızlandırdığı, hangilerinde yanıltıcı olduğu:
- Bir çıktının doğru olup olmadığını anlamak için geliştirdiğiniz kontrol alışkanlığı:
- AI kullanmadan önce problemi kendiniz tanımlamanın farkı:

---

## 5. Özet

Yapay zekâ bu projede **öğrenmeyi hızlandıran ve çıktıyı denetleyen bir araç** olarak kullanılmış; karar verici olarak kullanılmamıştır. Teknik kararlar, kapsam kararları ve test sonuçları projenin kendi dokümanlarında gerekçeleriyle kayıtlıdır. Üretilen hiçbir çıktı, çalıştırılarak veya kodla karşılaştırılarak doğrulanmadan projeye alınmamıştır.
