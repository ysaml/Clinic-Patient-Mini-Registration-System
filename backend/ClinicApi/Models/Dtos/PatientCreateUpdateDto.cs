using System.ComponentModel.DataAnnotations;

namespace ClinicApi.Models.Dtos;

public class PatientCreateUpdateDto
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(100)]
    public string MiddleName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public DateTime BirthDate { get; set; }

    [Required, StringLength(20)]
    public string Gender { get; set; } = string.Empty;

    [Required, StringLength(30)]
    public string ContactNumber { get; set; } = string.Empty;

    [Required, StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [StringLength(4000)]
    public string ClinicalProfile { get; set; } = string.Empty;

    [StringLength(4000)]
    public string Diagnosis { get; set; } = string.Empty;

    [StringLength(4000)]
    public string CurrentMedications { get; set; } = string.Empty;

    [StringLength(4000)]
    public string LatestLabs { get; set; } = string.Empty;
}