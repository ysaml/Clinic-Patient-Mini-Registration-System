using Microsoft.EntityFrameworkCore;
using ClinicApi.Models;


namespace ClinicApi.Data;
public class ClinicDbContext : DbContext
{
    public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options) { }

    public DbSet<Patient> Patients { get; set; }
    public DbSet<User> Users { get; set; }
}