package com.kolaysoft.weeklyprojectstatus.service;

import com.kolaysoft.weeklyprojectstatus.model.entity.RiskIssue;
import com.kolaysoft.weeklyprojectstatus.model.entity.WeeklyReport;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskIssueStatus;
import com.kolaysoft.weeklyprojectstatus.model.enums.RiskLevel;
import com.kolaysoft.weeklyprojectstatus.repository.RiskIssueRepository;
import com.kolaysoft.weeklyprojectstatus.repository.WeeklyReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Haftalik raporun risk seviyesini, o rapora bagli ACIK risk/engel
 * kayitlarindan turetir ve rapor uzerinde guncel tutar.
 *
 * <p><b>Neden turetiliyor.</b> Onceki surumde risk seviyesi rapor
 * formunda elle seciliyordu ve kayitli risklerle celisebiliyordu: bir
 * raporda cozulmemis YUKSEK seviyeli bes risk bulunsa bile kullanici
 * "Dusuk" secebiliyordu. Bu, On Analiz bolum 7.6'nin kabul kriterini
 * ("risk rapor altinda gosterilir VE dashboard ozetine yansir")
 * karsilamiyordu; dashboard kayitli riskleri hic okumuyordu.
 *
 * <p><b>Neden hesaplanan degil, saklanan alan.</b> Seviye tamamen
 * sorgu aninda hesaplansaydi, T13 filtre sozlesmesinin ("filtreleme
 * veritabani seviyesinde Specification ile uygulanir") gerektirdigi
 * kolon ortadan kalkardi ve risk filtresi Java tarafina kaymak
 * zorunda kalirdi. Bu nedenle kolon korunur, ancak kullanici girdisi
 * degildir: risk kaydi her degistiginde yeniden hesaplanir.
 */
@Service
public class RiskLevelResolver {

    /** Cozulmus riskler seviyeyi etkilemez. */
    private static final List<RiskIssueStatus> OPEN_STATUSES = List.of(
            RiskIssueStatus.OPEN,
            RiskIssueStatus.ACTION_IN_PROGRESS);

    /** Acik risk kaydi yoksa raporun seviyesi budur. */
    public static final RiskLevel DEFAULT_LEVEL = RiskLevel.LOW;

    private final RiskIssueRepository riskIssueRepository;
    private final WeeklyReportRepository weeklyReportRepository;

    public RiskLevelResolver(
            RiskIssueRepository riskIssueRepository,
            WeeklyReportRepository weeklyReportRepository) {
        this.riskIssueRepository = riskIssueRepository;
        this.weeklyReportRepository = weeklyReportRepository;
    }

    /**
     * Raporun risk seviyesini acik risk kayitlarindan yeniden hesaplar
     * ve degismisse kaydeder. Risk/engel olusturma, guncelleme ve silme
     * islemlerinden sonra cagrilir.
     */
    public void recompute(WeeklyReport weeklyReport) {
        RiskLevel resolved = DEFAULT_LEVEL;

        for (RiskIssue riskIssue : riskIssueRepository
                .findByWeeklyReport_IdInAndStatusIn(
                        List.of(weeklyReport.getId()),
                        OPEN_STATUSES)) {
            resolved = higherOf(resolved, riskIssue.getRiskLevel());
        }

        if (weeklyReport.getRiskLevel() != resolved) {
            weeklyReport.setRiskLevel(resolved);
            weeklyReportRepository.save(weeklyReport);
        }
    }

    /** Enum sirasi LOW &lt; MEDIUM &lt; HIGH oldugu icin ordinal karsilastirilir. */
    private static RiskLevel higherOf(RiskLevel first, RiskLevel second) {
        return first.ordinal() >= second.ordinal() ? first : second;
    }
}
