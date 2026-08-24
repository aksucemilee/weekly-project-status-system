package com.kolaysoft.weeklyprojectstatus.config;

import com.kolaysoft.weeklyprojectstatus.model.entity.Project;
import com.kolaysoft.weeklyprojectstatus.model.entity.ProjectAssignment;
import com.kolaysoft.weeklyprojectstatus.model.entity.RiskIssue;
import com.kolaysoft.weeklyprojectstatus.model.entity.User;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.model.entity.WorkItem;
import com.kolaysoft.weeklyprojectstatus.model.enums.AssignmentRole;
import com.kolaysoft.weeklyprojectstatus.model.enums.GeneralStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.ProjectStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueType;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.model.enums.ScheduleStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.WorkItemStatus;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectAssignmentRepository;
import com.kolaysoft.weeklyprojectstatus.repository.ProjectRepository;
import com.kolaysoft.weeklyprojectstatus.repository.RiskIssueRepository;
import com.kolaysoft.weeklyprojectstatus.repository.UserRepository;
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportRepository;
import com.kolaysoft.weeklyprojectstatus.repository.WorkItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

/**
 * Demo/sunum verisi olusturur.
 *
 * Neden seeder: yonetmelik README'de "ornek kullanici/veri" icin bir
 * "veri yukleme yontemi" istiyor (bolum 8.3) ve demo ortaminin temiz bir
 * kurulumda calistirilabilir olmasini bekliyor (bolum 10.1). Elle girilen
 * veri bunlari karsilamaz; seeder hem tekrar edilebilir hem de demo
 * sirasinda bir sey bozulursa saniyeler icinde sifirlanabilir olmasini
 * saglar.
 *
 * Veri seti, gelistirilen ozelliklerin demoda GORUNUR olmasi icin
 * tasarlanmistir:
 * - Bir projede 12 rapor var; sayfa boyutu 10 oldugu icin sayfalama
 *   kontrolu ancak boyle ortaya cikar.
 * - Dashboard sayaclarinin hepsi dolu: yuksek riskli, geciken ve bloke
 *   proje bulunuyor.
 * - Genel durum / risk / takvim degerleri cesitli, boylece filtreler bos
 *   sonuc donmuyor.
 * - Is kalemleri IN_PROGRESS/IN_TEST/BLOCKED durumlarinda; dashboard'daki
 *   "aktif is" sayaci bu durumlari sayiyor.
 * - Proje yoneticisi yalnizca 3 projeye atanmis; CTO hepsini goruyor.
 *   Rol farki boylece tek ekranda gosterilebiliyor.
 *
 * Rapor haftalari LocalDate.now() uzerinden hesaplanir; boylece veri ne
 * zaman yuklenirse yuklensin dashboard'un varsayilan "guncel hafta"
 * filtresine duser.
 *
 * Gercek musteri verisi kullanilmaz (yonetmelik 8.2); musteri adlari
 * acikca demo adlaridir.
 */
@Component
@Order(2)
public class DemoDataInitializer implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(DemoDataInitializer.class);

    private final ProjectRepository projectRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final WorkItemRepository workItemRepository;
    private final RiskIssueRepository riskIssueRepository;
    private final UserRepository userRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    @Value("${SEED_DEMO_DATA:false}")
    private boolean seedDemoData;

    public DemoDataInitializer(
            ProjectRepository projectRepository,
            WeeklyReportRepository weeklyReportRepository,
            WorkItemRepository workItemRepository,
            RiskIssueRepository riskIssueRepository,
            UserRepository userRepository,
            ProjectAssignmentRepository projectAssignmentRepository) {
        this.projectRepository = projectRepository;
        this.weeklyReportRepository = weeklyReportRepository;
        this.workItemRepository = workItemRepository;
        this.riskIssueRepository = riskIssueRepository;
        this.userRepository = userRepository;
        this.projectAssignmentRepository = projectAssignmentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            return;
        }

        // Idempotent: mevcut veri varsa hicbir sey yapilmaz, boylece
        // uygulama her acildiginda veri cogalmaz.
        if (projectRepository.count() > 0) {
            log.info("Demo verisi atlandı: veritabanında zaten proje kaydı var.");
            return;
        }

        LocalDate thisWeek = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        seedFlagshipProject(thisWeek);
        seedDelayedHighRiskProject(thisWeek);
        seedBlockedProject(thisWeek);
        seedPlannedProject(thisWeek);
        seedAtRiskProject(thisWeek);
        seedCompletedProject(thisWeek);

        seedAssignments();

        log.info("Demo verisi oluşturuldu: {} proje, {} haftalık rapor.",
                projectRepository.count(),
                weeklyReportRepository.count());
    }

    /**
     * Sayfalama demosunun dayandigi proje: 12 haftalik rapor icerir.
     * Sayfa boyutu 10 oldugu icin rapor listesinde 2 sayfa olusur.
     */
    private void seedFlagshipProject(LocalDate thisWeek) {
        Project project = createProject(
                "e-Fatura Entegrasyon Modülü",
                "Demo Perakende A.Ş.",
                "Elektronik fatura gönderim ve arşivleme akışının müşteri "
                        + "sistemleriyle entegrasyonu.",
                thisWeek.minusWeeks(13),
                thisWeek.plusWeeks(6),
                ProjectStatus.IN_PROGRESS);

        // 12 hafta: en eskiden en yeniye dogru ilerleyen bir proje.
        int[] target = { 5, 12, 20, 28, 35, 42, 50, 56, 62, 68, 74, 80 };
        int[] actual = { 5, 10, 18, 24, 33, 38, 45, 52, 60, 64, 71, 78 };

        GeneralStatus[] statuses = {
                GeneralStatus.PLANNED,
                GeneralStatus.IN_PROGRESS,
                GeneralStatus.IN_PROGRESS,
                GeneralStatus.IN_PROGRESS,
                GeneralStatus.DELAYED,
                GeneralStatus.IN_PROGRESS,
                GeneralStatus.IN_PROGRESS,
                GeneralStatus.IN_TEST,
                GeneralStatus.IN_PROGRESS,
                GeneralStatus.AT_RISK,
                GeneralStatus.IN_TEST,
                GeneralStatus.IN_TEST
        };

        String[] completed = {
                "Proje kapsamı netleştirildi, entegrasyon dokümanları incelendi.",
                "Fatura veri modeli çıkarıldı ve onaylandı.",
                "Gönderim servisinin ilk sürümü geliştirildi.",
                "Test ortamına ilk bağlantı sağlandı.",
                "Şema doğrulama hataları giderildi.",
                "Toplu gönderim akışı tamamlandı.",
                "Hata yönetimi ve yeniden deneme mekanizması eklendi.",
                "Entegrasyon testlerinin ilk turu çalıştırıldı.",
                "Test bulguları düzeltildi, performans ölçümü yapıldı.",
                "Müşteri test ortamında doğrulama başladı.",
                "Kabul testleri sürüyor, açık bulgular kapatılıyor.",
                "Kabul testlerinin büyük bölümü tamamlandı."
        };

        WeeklyReport lastReport = null;

        for (int index = 0; index < 12; index++) {
            LocalDate week = thisWeek.minusWeeks(11L - index);

            lastReport = createReport(
                    project,
                    week,
                    target[index],
                    actual[index],
                    statuses[index],
                    index == 4 ? ScheduleStatus.DELAYED : ScheduleStatus.ON_TRACK,
                    index == 9 ? RiskLevel.HIGH
                            : (index >= 6 ? RiskLevel.MEDIUM : RiskLevel.LOW),
                    completed[index],
                    "Sonraki hafta planı bir önceki rapordaki açık maddeler "
                            + "üzerinden güncellenmiştir.",
                    index == 4 ? "Test ortamı erişimi bir hafta gecikti." : "",
                    "Haftalık ilerleme planlanan çizgiye yakın seyrediyor.");
        }

        // Aktif is sayaci: IN_PROGRESS / IN_TEST / BLOCKED sayilir.
        createWorkItem(lastReport, "Kabul testi bulgularının kapatılması",
                "Müşteri tarafından iletilen 4 bulgu inceleniyor.",
                "Backend Ekibi", WorkItemStatus.IN_PROGRESS,
                thisWeek.plusDays(4), null);

        createWorkItem(lastReport, "Performans testi",
                "Yoğun gönderim senaryosu ölçülüyor.",
                "Test Ekibi", WorkItemStatus.IN_TEST,
                thisWeek.plusDays(3), null);

        createWorkItem(lastReport, "Entegrasyon dokümanının güncellenmesi",
                "Yeni hata kodları dokümana ekleniyor.",
                "Analiz", WorkItemStatus.COMPLETED,
                thisWeek.minusDays(2), thisWeek.minusDays(1));

        createRiskIssue(lastReport, RiskIssueType.RISK,
                "Müşteri tarafındaki test ortamı kararsız",
                "Test ortamı gün içinde zaman zaman yanıt vermiyor.",
                RiskLevel.MEDIUM,
                "Müşteri sistem ekibiyle haftalık kontrol toplantısı planlandı.",
                "Proje Yöneticisi", thisWeek.plusWeeks(1),
                RiskIssueStatus.ACTION_IN_PROGRESS);
    }

    /** Dashboard'daki "yüksek riskli" ve "geciken" sayaçlarını besler. */
    private void seedDelayedHighRiskProject(LocalDate thisWeek) {
        Project project = createProject(
                "PEYK İzin ve Bordro Modülü",
                "Demo Lojistik Ltd.",
                "İnsan kaynakları süreçlerinde izin talebi ve bordro "
                        + "hesaplama akışlarının geliştirilmesi.",
                thisWeek.minusWeeks(8),
                thisWeek.plusWeeks(2),
                ProjectStatus.IN_PROGRESS);

        createReport(project, thisWeek.minusWeeks(2), 45, 38,
                GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK,
                RiskLevel.MEDIUM,
                "İzin talep ekranı tamamlandı.",
                "Bordro hesaplama kurallarına geçilecek.",
                "", "");

        createReport(project, thisWeek.minusWeeks(1), 60, 44,
                GeneralStatus.DELAYED, ScheduleStatus.DELAYED,
                RiskLevel.MEDIUM,
                "Bordro kurallarının bir kısmı geliştirildi.",
                "Eksik kuralların tamamlanması hedefleniyor.",
                "Mevzuat değişikliği nedeniyle kurallar yeniden yorumlanıyor.",
                "Takvimde bir haftalık sapma oluştu.");

        WeeklyReport latest = createReport(project, thisWeek, 70, 48,
                GeneralStatus.DELAYED, ScheduleStatus.DELAYED,
                RiskLevel.HIGH,
                "Bordro hesaplama motorunun çekirdek kısmı tamamlandı.",
                "Mevzuat kaynaklı açık maddelerin kapatılması planlanıyor.",
                "Mevzuat yorumu için hukuk biriminden dönüş bekleniyor.",
                "Gecikme riski yükseldi; kapsam gözden geçirilecek.");

        createWorkItem(latest, "Mevzuat kurallarının netleştirilmesi",
                "Hukuk biriminden gelecek yoruma bağlı.",
                "Analiz", WorkItemStatus.BLOCKED,
                thisWeek.plusDays(2), null);

        createWorkItem(latest, "Bordro hesaplama testleri",
                "Örnek personel verisiyle doğrulama yapılıyor.",
                "Test Ekibi", WorkItemStatus.IN_PROGRESS,
                thisWeek.plusDays(5), null);

        createRiskIssue(latest, RiskIssueType.BLOCKER,
                "Mevzuat yorumu netleşmeden hesaplama tamamlanamıyor",
                "İlgili maddenin uygulanma biçimi belirsiz.",
                RiskLevel.HIGH,
                "Hukuk birimiyle ortak çalışma toplantısı talep edildi.",
                "Proje Yöneticisi", thisWeek.plusDays(3),
                RiskIssueStatus.OPEN);
    }

    /** Dashboard'daki "bloke" sayacını besler (proje durumu BLOCKED). */
    private void seedBlockedProject(LocalDate thisWeek) {
        Project project = createProject(
                "EczacıPOS Saha Yönetimi",
                "Demo Sağlık Grubu",
                "Saha ekiplerinin POS cihaz kurulum ve arıza kayıtlarını "
                        + "takip ettiği modül.",
                thisWeek.minusWeeks(6),
                thisWeek.plusWeeks(4),
                ProjectStatus.BLOCKED);

        createReport(project, thisWeek.minusWeeks(1), 30, 22,
                GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK,
                RiskLevel.MEDIUM,
                "Cihaz kayıt ekranı geliştirildi.",
                "Arıza kaydı akışına başlanacak.",
                "", "");

        WeeklyReport latest = createReport(project, thisWeek, 40, 24,
                GeneralStatus.BLOCKED, ScheduleStatus.DELAYED,
                RiskLevel.HIGH,
                "Arıza kaydı ekranının taslağı hazırlandı.",
                "Donanım test cihazları geldiğinde geliştirmeye devam edilecek.",
                "Test cihazları tedarik edilemediği için saha testleri "
                        + "başlatılamıyor.",
                "Proje donanım tedarikine bağlı olarak beklemede.");

        createWorkItem(latest, "Saha testleri",
                "Test cihazlarının tedarikine bağlı.",
                "Saha Ekibi", WorkItemStatus.BLOCKED,
                thisWeek.plusWeeks(1), null);

        createRiskIssue(latest, RiskIssueType.BLOCKER,
                "Test cihazları tedarik edilemedi",
                "Tedarikçi teslim tarihini iki hafta öteledi.",
                RiskLevel.HIGH,
                "Alternatif tedarikçi araştırması başlatıldı.",
                "Proje Yöneticisi", thisWeek.plusWeeks(2),
                RiskIssueStatus.ACTION_IN_PROGRESS);
    }

    /** Yeni başlayan, düşük riskli proje: filtre çeşitliliği sağlar. */
    private void seedPlannedProject(LocalDate thisWeek) {
        Project project = createProject(
                "e-İrsaliye Mobil Uygulaması",
                "Demo Nakliyat A.Ş.",
                "Sevkiyat sırasında e-irsaliye görüntüleme ve onaylama "
                        + "uygulaması.",
                thisWeek.minusWeeks(1),
                thisWeek.plusWeeks(12),
                ProjectStatus.PLANNED);

        createReport(project, thisWeek.minusWeeks(1), 0, 0,
                GeneralStatus.PLANNED, ScheduleStatus.ON_TRACK, RiskLevel.LOW,
                "Proje ekibi oluşturuldu, analiz çalışmasına başlandı.",
                "Ekran taslakları çıkarılacak.",
                "", "Proje henüz başlangıç aşamasında.");

        createReport(project, thisWeek, 8, 8,
                GeneralStatus.PLANNED, ScheduleStatus.ON_TRACK, RiskLevel.LOW,
                "Analiz dokümanının ilk sürümü hazırlandı.",
                "Teknik tasarım kararları netleştirilecek.",
                "", "Planlanan takvime uygun ilerliyor.");
    }

    /** Riskli ama gecikmemiş proje: risk ile takvim ayrımını gösterir. */
    private void seedAtRiskProject(LocalDate thisWeek) {
        Project project = createProject(
                "Müşteri Portalı Yenileme",
                "Demo Enerji A.Ş.",
                "Müşteri self servis portalının yeniden tasarlanması ve "
                        + "mevcut servislere bağlanması.",
                thisWeek.minusWeeks(10),
                thisWeek.plusWeeks(3),
                ProjectStatus.IN_PROGRESS);

        createReport(project, thisWeek.minusWeeks(2), 50, 47,
                GeneralStatus.IN_PROGRESS, ScheduleStatus.ON_TRACK,
                RiskLevel.LOW,
                "Yeni tasarımın ana ekranları geliştirildi.",
                "Servis entegrasyonlarına geçilecek.",
                "", "");

        WeeklyReport latest = createReport(project, thisWeek, 65, 58,
                GeneralStatus.AT_RISK, ScheduleStatus.ON_TRACK,
                RiskLevel.MEDIUM,
                "Servis entegrasyonlarının yarısı tamamlandı.",
                "Kalan servisler ve yük testleri planlanıyor.",
                "",
                "Takvim korunuyor ancak ekip kapasitesi riski izleniyor.");

        createWorkItem(latest, "Ödeme servisi entegrasyonu",
                "Sağlayıcı test ortamında doğrulanıyor.",
                "Backend Ekibi", WorkItemStatus.IN_TEST,
                thisWeek.plusDays(4), null);

        createRiskIssue(latest, RiskIssueType.RISK,
                "Ekip kapasitesi yetersiz kalabilir",
                "İki geliştirici başka projeye kısmi olarak destek veriyor.",
                RiskLevel.MEDIUM,
                "Kapasite planı gözden geçirilecek.",
                "Proje Yöneticisi", thisWeek.plusWeeks(1),
                RiskIssueStatus.OPEN);
    }

    /** Tamamlanmış proje: durum çeşitliliği ve filtre demosu için. */
    private void seedCompletedProject(LocalDate thisWeek) {
        Project project = createProject(
                "Arşiv Raporlama Altyapısı",
                "Demo Finans A.Ş.",
                "Geçmiş belgelerin raporlanabilir bir yapıya taşınması.",
                thisWeek.minusWeeks(14),
                thisWeek.minusWeeks(1),
                ProjectStatus.COMPLETED);

        createReport(project, thisWeek.minusWeeks(2), 90, 88,
                GeneralStatus.IN_TEST, ScheduleStatus.ON_TRACK, RiskLevel.LOW,
                "Kabul testleri tamamlandı.",
                "Devreye alma planlanıyor.",
                "", "");

        createReport(project, thisWeek.minusWeeks(1), 100, 100,
                GeneralStatus.COMPLETED, ScheduleStatus.ON_TRACK,
                RiskLevel.LOW,
                "Sistem devreye alındı ve müşteriye teslim edildi.",
                "Kapanış dokümantasyonu tamamlanacak.",
                "", "Proje planlanan takvimde tamamlandı.");
    }

    /**
     * Rol farkinin demoda gorulebilmesi icin: proje yoneticisi yalnizca 3
     * projeye, ekip lideri 2 projeye atanir. CTO tum projeleri gorur.
     */
    private void seedAssignments() {
        List<Project> projects = projectRepository.findByActiveTrueOrderByNameAsc();

        assignByProjectName("pm@demo.local", AssignmentRole.PROJE_YONETICISI,
                projects, List.of(
                        "e-Fatura Entegrasyon Modülü",
                        "PEYK İzin ve Bordro Modülü",
                        "EczacıPOS Saha Yönetimi"));

        assignByProjectName("lider@demo.local", AssignmentRole.EKIP_LIDERI,
                projects, List.of(
                        "e-Fatura Entegrasyon Modülü",
                        "Müşteri Portalı Yenileme"));
    }

    private void assignByProjectName(
            String email,
            AssignmentRole assignmentRole,
            List<Project> projects,
            List<String> projectNames) {
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            log.warn("Demo ataması atlandı: {} kullanıcısı bulunamadı.", email);
            return;
        }

        for (Project project : projects) {
            if (!projectNames.contains(project.getName())) {
                continue;
            }

            ProjectAssignment assignment = new ProjectAssignment();
            assignment.setProject(project);
            assignment.setUser(user);
            assignment.setAssignmentRole(assignmentRole);
            assignment.setActive(true);

            projectAssignmentRepository.save(assignment);
        }
    }

    private Project createProject(
            String name,
            String customerName,
            String description,
            LocalDate startDate,
            LocalDate targetEndDate,
            ProjectStatus status) {
        Project project = new Project();

        project.setName(name);
        project.setCustomerName(customerName);
        project.setDescription(description);
        project.setStartDate(startDate);
        project.setTargetEndDate(targetEndDate);
        project.setStatus(status);
        project.setActive(true);

        return projectRepository.save(project);
    }

    private WeeklyReport createReport(
            Project project,
            LocalDate weekStart,
            int targetProgress,
            int actualProgress,
            GeneralStatus generalStatus,
            ScheduleStatus scheduleStatus,
            RiskLevel riskLevel,
            String completedSummary,
            String nextWeekPlan,
            String blockers,
            String generalNote) {
        WeeklyReport report = new WeeklyReport();

        report.setProject(project);
        report.setReportWeekStart(weekStart);
        report.setTargetProgress(targetProgress);
        report.setActualProgress(actualProgress);
        report.setGeneralStatus(generalStatus);
        report.setScheduleStatus(scheduleStatus);
        report.setRiskLevel(riskLevel);
        report.setCompletedSummary(completedSummary);
        report.setNextWeekPlan(nextWeekPlan);
        report.setBlockers(blockers);
        report.setGeneralNote(generalNote);

        return weeklyReportRepository.save(report);
    }

    private void createWorkItem(
            WeeklyReport report,
            String title,
            String description,
            String responsible,
            WorkItemStatus status,
            LocalDate plannedDate,
            LocalDate completedDate) {
        WorkItem workItem = new WorkItem();

        workItem.setWeeklyReport(report);
        workItem.setTitle(title);
        workItem.setDescription(description);
        workItem.setResponsible(responsible);
        workItem.setStatus(status);
        workItem.setPlannedDate(plannedDate);
        workItem.setCompletedDate(completedDate);

        workItemRepository.save(workItem);
    }

    private void createRiskIssue(
            WeeklyReport report,
            RiskIssueType type,
            String title,
            String description,
            RiskLevel riskLevel,
            String actionPlan,
            String responsible,
            LocalDate targetDate,
            RiskIssueStatus status) {
        RiskIssue riskIssue = new RiskIssue();

        riskIssue.setWeeklyReport(report);
        riskIssue.setType(type);
        riskIssue.setTitle(title);
        riskIssue.setDescription(description);
        riskIssue.setRiskLevel(riskLevel);
        riskIssue.setActionPlan(actionPlan);
        riskIssue.setResponsible(responsible);
        riskIssue.setTargetDate(targetDate);
        riskIssue.setStatus(status);

        riskIssueRepository.save(riskIssue);
    }
}
